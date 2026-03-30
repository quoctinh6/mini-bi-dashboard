/**
 * prisma/seed.js
 * Seed dữ liệu mẫu cho Kernel404 BI Dashboard
 * Chạy: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDecimal = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const randDate = (startYear = 2023, endYear = 2024) => {
  const start = new Date(`${startYear}-01-01`);
  const end   = new Date(`${endYear}-12-31`);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function main() {
  console.log('🌱 Starting seed...');

  // ── Roles ───────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'ADMIN' },    update: {}, create: { name: 'ADMIN' } }),
    prisma.role.upsert({ where: { name: 'DIRECTOR' }, update: {}, create: { name: 'DIRECTOR' } }),
    prisma.role.upsert({ where: { name: 'MANAGER' },  update: {}, create: { name: 'MANAGER' } }),
    prisma.role.upsert({ where: { name: 'EMPLOYEE' }, update: {}, create: { name: 'EMPLOYEE' } }),
  ]);
  const [adminRole, directorRole, managerRole] = roles;
  console.log('✅ Roles seeded');

  // ── Regions ─────────────────────────────────────────────
  const [north, central, south] = await Promise.all([
    prisma.region.upsert({ where: { code: 'NORTH' },   update: {}, create: { code: 'NORTH',   name: 'Miền Bắc' } }),
    prisma.region.upsert({ where: { code: 'CENTRAL' }, update: {}, create: { code: 'CENTRAL', name: 'Miền Trung' } }),
    prisma.region.upsert({ where: { code: 'SOUTH' },   update: {}, create: { code: 'SOUTH',   name: 'Miền Nam' } }),
  ]);
  console.log('✅ Regions seeded');

  // ── Provinces — 34 tỉnh/thành phố trực thuộc TW (sau sáp nhập 2025) ──
  const provinceSeed = [

    // ═══ MIỀN BẮC — 13 đơn vị ═════════════════════════════════
    { code: 'HN',    name: 'Hà Nội',          regionId: north.id },  // gộp Vĩnh Phúc + Hòa Bình
    { code: 'HP',    name: 'Hải Phòng',        regionId: north.id },  // gộp Hải Dương
    { code: 'QNINH', name: 'Quảng Ninh',       regionId: north.id },
    { code: 'LCI',   name: 'Lào Cai',          regionId: north.id },  // gộp Yên Bái
    { code: 'HG',    name: 'Hà Giang',         regionId: north.id },  // gộp Tuyên Quang
    { code: 'CB',    name: 'Cao Bằng',         regionId: north.id },  // gộp Bắc Kạn
    { code: 'TNG',   name: 'Thái Nguyên',      regionId: north.id },  // gộp Bắc Giang + Bắc Ninh
    { code: 'SLA',   name: 'Sơn La',           regionId: north.id },  // gộp Điện Biên + Lai Châu
    { code: 'PT',    name: 'Phú Thọ',          regionId: north.id },
    { code: 'TB',    name: 'Thái Bình',        regionId: north.id },  // gộp Hưng Yên + Nam Định
    { code: 'HNM',   name: 'Hà Nam',           regionId: north.id },  // gộp Ninh Bình
    { code: 'TH',    name: 'Thanh Hóa',        regionId: north.id },
    { code: 'NBAC',  name: 'Ninh Bắc',         regionId: north.id },  // Hưng Yên (đã gộp riêng)

    // ═══ MIỀN TRUNG — 11 đơn vị ════════════════════════════════
    { code: 'NAN',   name: 'Nghệ An',          regionId: central.id }, // gộp Hà Tĩnh
    { code: 'QBINH', name: 'Quảng Bình',       regionId: central.id }, // gộp Quảng Trị
    { code: 'HUE',   name: 'Huế',              regionId: central.id }, // Thừa Thiên Huế đổi tên
    { code: 'DN',    name: 'Đà Nẵng',          regionId: central.id }, // gộp Quảng Nam
    { code: 'QNGAI', name: 'Quảng Ngãi',       regionId: central.id }, // gộp Bình Định
    { code: 'PYEN',  name: 'Phú Yên',          regionId: central.id }, // gộp Khánh Hòa
    { code: 'NTH',   name: 'Ninh Thuận',       regionId: central.id }, // gộp Bình Thuận
    { code: 'GL',    name: 'Gia Lai',          regionId: central.id }, // gộp Kon Tum
    { code: 'DLK',   name: 'Đắk Lắk',         regionId: central.id }, // gộp Đắk Nông
    { code: 'LDG',   name: 'Lâm Đồng',        regionId: central.id }, // gộp Bình Phước
    { code: 'BTHUAN',name: 'Bình Thuận',       regionId: central.id },

    // ═══ MIỀN NAM — 10 đơn vị ══════════════════════════════════
    { code: 'HCM',   name: 'TP. Hồ Chí Minh', regionId: south.id },  // gộp Bình Dương + Bà Rịa–VT
    { code: 'DNAI',  name: 'Đồng Nai',         regionId: south.id },  // gộp Tây Ninh
    { code: 'LAN',   name: 'Long An',          regionId: south.id },  // gộp Tiền Giang
    { code: 'DTHAP', name: 'Đồng Tháp',        regionId: south.id },  // gộp An Giang
    { code: 'BTE',   name: 'Bến Tre',          regionId: south.id },  // gộp Trà Vinh
    { code: 'VLG',   name: 'Vĩnh Long',        regionId: south.id },  // gộp Hậu Giang
    { code: 'CTHO',  name: 'Cần Thơ',          regionId: south.id },  // gộp Sóc Trăng
    { code: 'KGG',   name: 'Kiên Giang',       regionId: south.id },  // gộp Cà Mau + Bạc Liêu
    { code: 'BDUONG',name: 'Bình Dương (mở rộng)', regionId: south.id }, // đã tích hợp vào HCM nhưng giữ để map
    { code: 'BRVT',  name: 'Bà Rịa – Vũng Tàu', regionId: south.id },
  ];

  console.log(`   → ${provinceSeed.length} provinces prepared`);

  const provinces = {};
  for (const p of provinceSeed) {
    const created = await prisma.province.upsert({
      where:  { code: p.code },
      update: { name: p.name, regionId: p.regionId },
      create: p,
    });
    provinces[p.code] = created;
  }
  console.log(`✅ Provinces seeded (${provinceSeed.length} tỉnh/thành)`);

  // ── Categories ──────────────────────────────────────────
  const categorySeed = [
    { code: 'SW',  name: 'Phần mềm' },
    { code: 'HW',  name: 'Thiết bị' },
    { code: 'SVC', name: 'Dịch vụ' },
    { code: 'TRN', name: 'Đào tạo' },
    { code: 'CNT', name: 'Tư vấn' },
    { code: 'MNT', name: 'Bảo trì' },
  ];
  const categories = {};
  for (const c of categorySeed) {
    const created = await prisma.category.upsert({ where: { code: c.code }, update: {}, create: c });
    categories[c.code] = created;
  }
  console.log('✅ Categories seeded');

  // ── Departments ─────────────────────────────────────────
  const deptSeed = [
    { code: 'SALES', name: 'Kinh doanh' },
    { code: 'TECH',  name: 'Kỹ thuật' },
    { code: 'MKT',   name: 'Marketing' },
    { code: 'OPS',   name: 'Vận hành' },
  ];
  const departments = {};
  for (const d of deptSeed) {
    const created = await prisma.department.upsert({ where: { code: d.code }, update: {}, create: d });
    departments[d.code] = created;
  }
  console.log('✅ Departments seeded');

  // ── Users ────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where:  { username: 'admin' },
    update: {},
    create: {
      username:     'admin',
      passwordHash: await bcrypt.hash('admin123', 10),
      email:        'admin@kernel404.vn',
      fullName:     'Quản Trị Viên',
      roleId:       adminRole.id,
    },
  });

  const directorUser = await prisma.user.upsert({
    where:  { username: 'giamdoc' },
    update: {},
    create: {
      username:     'giamdoc',
      passwordHash: await bcrypt.hash('director123', 10),
      email:        'director@kernel404.vn',
      fullName:     'Nguyễn Văn A',
      roleId:       directorRole.id,
    },
  });

  const managerNorth = await prisma.user.upsert({
    where:  { username: 'truongphong_bac' },
    update: {},
    create: {
      username:     'truongphong_bac',
      passwordHash: await bcrypt.hash('manager123', 10),
      email:        'north.manager@kernel404.vn',
      fullName:     'Trần Thị B',
      roleId:       managerRole.id,
    },
  });

  const managerSouth = await prisma.user.upsert({
    where:  { username: 'truongphong_nam' },
    update: {},
    create: {
      username:     'truongphong_nam',
      passwordHash: await bcrypt.hash('manager123', 10),
      email:        'south.manager@kernel404.vn',
      fullName:     'Lê Văn C',
      roleId:       managerRole.id,
    },
  });
  console.log('✅ Users seeded (4 accounts)');

  // ── UserRegionAccess (RLS mapping) ──────────────────────
  await prisma.userRegionAccess.upsert({
    where:  { userId_regionId: { userId: managerNorth.id, regionId: north.id } },
    update: {},
    create: { userId: managerNorth.id, regionId: north.id },
  });
  await prisma.userRegionAccess.upsert({
    where:  { userId_regionId: { userId: managerSouth.id, regionId: south.id } },
    update: {},
    create: { userId: managerSouth.id, regionId: south.id },
  });
  console.log('✅ UserRegionAccess (RLS) seeded');

  // ── Targets (12 tháng × 4 vùng × 2 năm) ────────────────
  const regionTargets = [north.id, central.id, south.id, null];
  for (const year of [2024, 2025]) {
    for (let month = 1; month <= 12; month++) {
      for (const regionId of regionTargets) {
        await prisma.target.upsert({
          where:  { year_month_regionId: { year, month, regionId } },
          update: {},
          create: {
            year,
            month,
            regionId,
            revenue: randDecimal(800_000_000, 2_000_000_000),
          },
        });
      }
    }
  }
  console.log('✅ Targets seeded (2024 + 2025)');

  // ── Kernel404 Transactions — 50,000 rows ────────────────
  console.log('📦 Seeding 50,000 transactions (batch insert, please wait)...');

  const provinceList   = Object.values(provinces);
  const categoryList   = Object.values(categories);
  const departmentList = Object.values(departments);
  const BATCH_SIZE = 1000;
  const TOTAL      = 50_000;

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batchLen = Math.min(BATCH_SIZE, TOTAL - i);
    const batch = Array.from({ length: batchLen }, () => {
      const province = provinceList[rand(0, provinceList.length - 1)];
      const category = categoryList[rand(0, categoryList.length - 1)];
      const dept     = departmentList[rand(0, departmentList.length - 1)];
      const revenue  = randDecimal(5_000_000, 500_000_000);
      const cost     = parseFloat((revenue * randDecimal(0.35, 0.65)).toFixed(2));

      return {
        orderDate:    randDate(2024, 2025),
        revenue,
        cost,
        quantity:     rand(1, 20),
        regionId:     province.regionId,
        provinceId:   province.id,
        categoryId:   category.id,
        departmentId: dept.id,
      };
    });

    await prisma.kernel404.createMany({ data: batch });
    process.stdout.write(`\r  ↳ Inserted ${Math.min(i + BATCH_SIZE, TOTAL).toLocaleString()} / ${TOTAL.toLocaleString()}`);
  }

  console.log('\n✅ Transactions seeded (50,000 rows)');
  console.log('\n🎉 Seed complete!');
  console.log('──────────────────────────────────────────');
  console.log('Default accounts:');
  console.log('  admin           / admin123    (ADMIN — full access)');
  console.log('  giamdoc         / director123 (DIRECTOR — toàn quốc)');
  console.log('  truongphong_bac / manager123  (MANAGER — chỉ Miền Bắc)');
  console.log('  truongphong_nam / manager123  (MANAGER — chỉ Miền Nam)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
