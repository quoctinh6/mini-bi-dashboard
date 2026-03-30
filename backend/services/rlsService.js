/**
 * services/rlsService.js
 * Centralised Row-Level Security helper.
 *
 * Usage:
 *   const whereClause = await buildRlsFilter(req.user, prisma);
 *   const data = await prisma.kernel404.findMany({ where: whereClause });
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Builds the Prisma `where` clause that enforces RLS.
 *
 * Rules:
 *  - ADMIN / DIRECTOR  → no restriction (returns {})
 *  - MANAGER / EMPLOYEE → restricted to their assigned regionIds via UserRegionAccess
 *
 * @param {object} jwtUser   - Decoded JWT payload: { id, role }
 * @param {PrismaClient} prisma
 * @returns {Promise<object>} Prisma where-clause fragment
 */
async function buildRlsFilter(jwtUser, prisma) {
  const { id: userId, role } = jwtUser;

  // Admins and Directors see everything
  if (role === 'ADMIN' || role === 'DIRECTOR') {
    return {};
  }

  // Fetch allowed regions for this user from the access-control table
  const accessRows = await prisma.userRegionAccess.findMany({
    where: { userId },
    select: { regionId: true },
  });

  if (!accessRows.length) {
    // User has NO region assigned → return impossible filter (zero results)
    return { regionId: { in: [] } };
  }

  const allowedRegionIds = accessRows.map((r) => r.regionId);
  return { regionId: { in: allowedRegionIds } };
}

/**
 * Convenience: verify and throw 403 if user can't access a specific regionId
 */
async function assertRegionAccess(jwtUser, regionId, prisma) {
  if (jwtUser.role === 'ADMIN' || jwtUser.role === 'DIRECTOR') return true;

  const access = await prisma.userRegionAccess.findFirst({
    where: { userId: jwtUser.id, regionId },
  });
  if (!access) {
    const err = new Error('Access denied: region not in your scope.');
    err.status = 403;
    throw err;
  }
  return true;
}

module.exports = { buildRlsFilter, assertRegionAccess };
