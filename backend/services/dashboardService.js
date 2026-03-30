/**
 * services/dashboardService.js
 * Core aggregation logic for the Dashboard Overview page.
 * All queries go through the RLS filter automatically.
 */

const { buildRlsFilter } = require('./rlsService');
const prisma = require('../config/prisma');

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/**
 * Parse the dateRange param and return a Prisma date filter.
 * Accepts: { startDate, endDate } strings in ISO format.
 * Falls back to current calendar year if omitted.
 */
function buildDateFilter(startDate, endDate) {
  const start = startDate
    ? new Date(startDate)
    : new Date(`${new Date().getFullYear()}-01-01`);

  const end = endDate
    ? new Date(endDate)
    : new Date(`${new Date().getFullYear()}-12-31`);

  return { gte: start, lte: end };
}

/**
 * Compare current period revenue to previous period (same duration, shifted back).
 * Used for growth rate calculation.
 */
function getPreviousPeriod(startDate, endDate) {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();

  return {
    gte: new Date(start.getTime() - durationMs),
    lte: new Date(start.getTime() - 1), // 1ms before current start
  };
}

// ─────────────────────────────────────────────────────────
// Main Service Function
// ─────────────────────────────────────────────────────────

/**
 * getDashboardOverview
 *
 * Returns a single aggregated JSON response for the Dashboard Overview page:
 *  - totalRevenue / totalCost / totalProfit
 *  - growthRate    (vs previous same-length period)
 *  - revenueByMonth (for Mixed / Bar chart)
 *  - revenueByCategory (for Donut chart)
 *  - revenueByProvince  (for Geo / GaugeChart)
 *  - revenueByRegion    (for regional breakdown)
 *  - targetAchievement  (current vs target)
 *
 * @param {object} jwtUser  - { id, role } from JWT payload
 * @param {object} params   - { startDate?, endDate?, regionId? }
 */
async function getDashboardOverview(jwtUser, params = {}) {
  const { startDate, endDate, regionId } = params;

  // 1. Build RLS filter — this is the security gate
  const rlsWhere = await buildRlsFilter(jwtUser, prisma);

  // 2. Build date filter
  const dateFilter = buildDateFilter(startDate, endDate);
  const prevDateFilter = getPreviousPeriod(
    startDate || `${new Date().getFullYear()}-01-01`,
    endDate   || `${new Date().getFullYear()}-12-31`
  );

  // 3. Optional region drill-down (applied on top of RLS)
  const regionFilter = regionId ? { regionId: parseInt(regionId, 10) } : {};

  // Combine all where conditions
  const baseWhere = {
    ...rlsWhere,
    ...regionFilter,
    orderDate: dateFilter,
  };

  const prevWhere = {
    ...rlsWhere,
    ...regionFilter,
    orderDate: prevDateFilter,
  };

  // ── Run all aggregations in parallel ─────────────────────
  const [
    currentTotals,
    previousTotals,
    revenueByMonthRaw,
    revenueByCategoryRaw,
    revenueByProvinceRaw,
    revenueByRegionRaw,
    targets,
  ] = await Promise.all([

    // Totals for current period
    prisma.kernel404.aggregate({
      where: baseWhere,
      _sum:   { revenue: true, cost: true },
      _count: { id: true },
    }),

    // Totals for previous period (growth rate)
    prisma.kernel404.aggregate({
      where: prevWhere,
      _sum: { revenue: true },
    }),

    // Revenue grouped by month (for bar/line chart)
    // Revenue grouped by month (for bar/line chart) - Safely handle RLS and region filters
    (() => {
      let rlsClause = '';
      if (rlsWhere.regionId) {
        const ids = rlsWhere.regionId.in;
        rlsClause = ids.length > 0 ? `AND region_id IN (${ids.join(',')})` : 'AND 1=0';
      }

      let extraFilter = '';
      if (regionFilter.regionId) {
        extraFilter = `AND region_id = ${regionFilter.regionId}`;
      }

      // Convert dates to ISO strings for MySQL safety in raw queries
      const startStr = dateFilter.gte.toISOString().slice(0, 19).replace('T', ' ');
      const endStr   = dateFilter.lte.toISOString().slice(0, 19).replace('T', ' ');

      return prisma.$queryRawUnsafe(`
        SELECT
          DATE_FORMAT(order_date, '%Y-%m') AS month,
          SUM(revenue)                     AS revenue,
          SUM(cost)                        AS cost
        FROM kernel404_transactions
        WHERE order_date >= ? AND order_date <= ?
          ${rlsClause}
          ${extraFilter}
        GROUP BY month
        ORDER BY month ASC
      `, startStr, endStr);
    })(),

    // Revenue grouped by Category (for Donut chart)
    prisma.kernel404.groupBy({
      by: ['categoryId'],
      where: baseWhere,
      _sum: { revenue: true },
      orderBy: { _sum: { revenue: 'desc' } },
    }),

    // Revenue grouped by Province (for Map / Gauge chart)
    prisma.kernel404.groupBy({
      by: ['provinceId'],
      where: baseWhere,
      _sum: { revenue: true },
      orderBy: { _sum: { revenue: 'desc' } },
    }),

    // Revenue grouped by Region
    prisma.kernel404.groupBy({
      by: ['regionId'],
      where: { ...rlsWhere, orderDate: dateFilter },
      _sum: { revenue: true, cost: true },
    }),

    // Target for the period (if available)
    prisma.target.findMany({
      where: {
        year:  { in: getYearsInRange(dateFilter.gte, dateFilter.lte) },
        ...(rlsWhere.regionId ? { regionId: { in: rlsWhere.regionId.in } } : {}),
      },
      select: { revenue: true, year: true, month: true, regionId: true },
    }),
  ]);

  // ── Enrich grouped results with master-data names ─────────

  // Load Category and Province lookups in one go
  const [categoryMap, provinceMap, regionMap] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true, code: true } })
      .then((rows) => Object.fromEntries(rows.map((r) => [r.id, r]))),
    prisma.province.findMany({ select: { id: true, name: true, code: true } })
      .then((rows) => Object.fromEntries(rows.map((r) => [r.id, r]))),
    prisma.region.findMany({ select: { id: true, name: true, code: true } })
      .then((rows) => Object.fromEntries(rows.map((r) => [r.id, r]))),
  ]);

  // ── Compute derived metrics ──────────────────────────────

  const totalRevenue  = Number(currentTotals._sum.revenue || 0);
  const totalCost     = Number(currentTotals._sum.cost    || 0);
  const totalProfit   = totalRevenue - totalCost;
  const prevRevenue   = Number(previousTotals._sum.revenue || 0);
  const totalOrders   = currentTotals._count.id || 0;

  const growthRate = prevRevenue > 0
    ? parseFloat((((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(2))
    : 0;

  const totalTarget = targets.reduce((sum, t) => sum + Number(t.revenue), 0);
  const targetAchievement = totalTarget > 0
    ? parseFloat(((totalRevenue / totalTarget) * 100).toFixed(2))
    : null;

  // ── Format output arrays ──────────────────────────────────
  const revenueByCategory = revenueByCategoryRaw.map((item) => ({
    categoryId: item.categoryId,
    label:      categoryMap[item.categoryId]?.name  || 'Unknown',
    code:       categoryMap[item.categoryId]?.code  || '',
    value:      Number(item._sum.revenue || 0),
  }));

  const revenueByProvince = revenueByProvinceRaw.map((item) => ({
    provinceId: item.provinceId,
    label:      provinceMap[item.provinceId]?.name || 'Unknown',
    code:       provinceMap[item.provinceId]?.code || '',
    value:      Number(item._sum.revenue || 0),
  }));

  const revenueByRegion = revenueByRegionRaw.map((item) => ({
    regionId: item.regionId,
    label:    regionMap[item.regionId]?.name || 'Unknown',
    code:     regionMap[item.regionId]?.code || '',
    revenue:  Number(item._sum.revenue || 0),
    cost:     Number(item._sum.cost    || 0),
    profit:   Number(item._sum.revenue || 0) - Number(item._sum.cost || 0),
  }));

  const revenueByMonth = (revenueByMonthRaw || []).map((item) => ({
    month:   item.month,
    revenue: Number(item.revenue || 0),
    cost:    Number(item.cost    || 0),
    profit:  Number(item.revenue || 0) - Number(item.cost || 0),
  }));

  return {
    meta: {
      generatedAt:  new Date().toISOString(),
      rlsApplied:   jwtUser.role !== 'ADMIN' && jwtUser.role !== 'DIRECTOR',
      userRole:     jwtUser.role,
      dateRange:    { start: dateFilter.gte, end: dateFilter.lte },
    },
    kpi: {
      totalRevenue,
      totalCost,
      totalProfit,
      totalOrders,
      growthRate,
      isPositive:        growthRate >= 0,
      targetAchievement, // % so với target; null nếu không có target
    },
    charts: {
      revenueByMonth,    // Bar / Line chart
      revenueByCategory, // Donut chart
      revenueByProvince, // Geo / Gauge chart
      revenueByRegion,   // Regional breakdown (Gauge bán nguyệt)
    },
  };
}

// ─────────────────────────────────────────────────────────
// Analytics: individual endpoints
// ─────────────────────────────────────────────────────────

/**
 * getSalesGrouped — used by /api/analytics/sales
 * Groups by 'Date', 'Province', 'Department', or 'Category'
 */
async function getSalesGrouped(jwtUser, { startDate, endDate, groupBy = 'Date', department }) {
  const rlsWhere  = await buildRlsFilter(jwtUser, prisma);
  const dateFilter = buildDateFilter(startDate, endDate);

  const baseWhere = {
    ...rlsWhere,
    orderDate: dateFilter,
    ...(department && department !== 'All' ? { department: { name: department } } : {}),
  };

  let data = [];

  switch (groupBy) {
    case 'Date':
      data = await prisma.kernel404.groupBy({
        by: ['orderDate'],
        where: baseWhere,
        _sum: { revenue: true },
        orderBy: { orderDate: 'asc' },
      });
      return data.map((d) => ({
        label: d.orderDate?.toISOString().split('T')[0] || '',
        value: Number(d._sum.revenue || 0),
      }));

    case 'Province': {
      const rows = await prisma.kernel404.groupBy({
        by: ['provinceId'],
        where: baseWhere,
        _sum: { revenue: true },
      });
      const pMap = await prisma.province.findMany({ select: { id: true, code: true, name: true } })
        .then((r) => Object.fromEntries(r.map((x) => [x.id, x])));
      return rows.map((d) => ({
        label: pMap[d.provinceId]?.name || 'Unknown',
        code:  pMap[d.provinceId]?.code || '',
        value: Number(d._sum.revenue || 0),
      }));
    }

    case 'Department': {
      const rows = await prisma.kernel404.groupBy({
        by: ['departmentId'],
        where: baseWhere,
        _sum: { revenue: true },
      });
      const dMap = await prisma.department.findMany({ select: { id: true, code: true, name: true } })
        .then((r) => Object.fromEntries(r.map((x) => [x.id, x])));
      return rows.map((d) => ({
        label: dMap[d.departmentId]?.name || 'Unknown',
        code:  dMap[d.departmentId]?.code || '',
        value: Number(d._sum.revenue || 0),
      }));
    }

    case 'Category': {
      const rows = await prisma.kernel404.groupBy({
        by: ['categoryId'],
        where: baseWhere,
        _sum: { revenue: true },
      });
      const cMap = await prisma.category.findMany({ select: { id: true, code: true, name: true } })
        .then((r) => Object.fromEntries(r.map((x) => [x.id, x])));
      return rows.map((d) => ({
        label: cMap[d.categoryId]?.name || 'Unknown',
        code:  cMap[d.categoryId]?.code || '',
        value: Number(d._sum.revenue || 0),
      }));
    }

    default:
      throw Object.assign(new Error('Invalid groupBy parameter'), { status: 400 });
  }
}

// ─────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────

function getYearsInRange(start, end) {
  const years = new Set();
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) years.add(y);
  return [...years];
}

module.exports = { getDashboardOverview, getSalesGrouped };
