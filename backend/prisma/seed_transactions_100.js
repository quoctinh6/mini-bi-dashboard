const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDecimal = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const randDate = (startYear = 2024, endYear = 2025) => {
  const start = new Date(`${startYear}-01-01`);
  const end   = new Date(`${endYear}-12-31`);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function main() {
  console.log('🌱 Seed starting: kernel404_transactions (100 rows)...');

  // 1. Lấy dữ liệu danh mục để tạo quan hệ
  const provinces = await prisma.province.findMany();
  const categories = await prisma.category.findMany();
  const departments = await prisma.department.findMany();

  if (provinces.length === 0 || categories.length === 0 || departments.length === 0) {
    console.error('❌ Error: Master data (provinces, categories, departments) is missing. Run the main seed first.');
    return;
  }

  // 2. Xóa các giao dịch cũ để đảm bảo chỉ có đúng 100 dòng mới (tùy chọn)
  console.log('🧹 Clearing existing transactions...');
  await prisma.kernel404.deleteMany();

  // 3. Tạo 100 dòng dữ liệu mẫu
  console.log('📦 Generating 100 transactions...');
  const batch = Array.from({ length: 100 }, () => {
    const province = provinces[rand(0, provinces.length - 1)];
    const category = categories[rand(0, categories.length - 1)];
    const dept     = departments[rand(0, departments.length - 1)];
    
    // Doanh thu từ 5 triệu đến 500 triệu
    const revenue  = randDecimal(5_000_000, 500_000_000);
    // Giá vốn từ 35% đến 65% doanh thu
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

  // 4. Lưu vào database
  await prisma.kernel404.createMany({ data: batch });

  console.log('✅ Seeding successful: 100 rows created in "kernel404_transactions".');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
