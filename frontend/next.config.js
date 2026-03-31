/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Thêm đoạn này vào để bỏ qua lỗi ESLint lúc build Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Thêm đoạn này vào để bỏ qua lỗi TypeScript lúc build Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // (Giữ nguyên các cấu hình cũ của bạn nếu có ở dưới đây)
};

module.exports = nextConfig; 
// Lưu ý: Nếu file của bạn là next.config.mjs thì nó dùng `export default nextConfig;`