const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

/**
 * Lấy danh sách người dùng theo Role phân cấp
 * DIRECTOR: Thấy MANAGER & EMPLOYEE
 * MANAGER: Chỉ thấy EMPLOYEE thuộc Region của mình
 */
const getUsers = async (req, res) => {
  try {
    const userRole = req.user.role;
    let users = [];

    const includeOptions = {
      role: true,
      regionAccess: {
        include: { region: true }
      }
    };

    if (userRole === 'ADMIN' || userRole === 'DIRECTOR') {
      // Giám đốc xem được Trưởng phòng và Nhân viên
      users = await prisma.user.findMany({
        where: { role: { name: { in: ['MANAGER', 'EMPLOYEE'] } } },
        include: includeOptions,
        orderBy: { createdAt: 'desc' }
      });
    } else if (userRole === 'MANAGER') {
      // Trưởng phòng chỉ xem được Nhân viên trong vùng của mình
      const managerRegions = req.user.regionAccess.map(ra => ra.regionId);
      users = await prisma.user.findMany({
        where: {
          role: { name: 'EMPLOYEE' },
          regionAccess: { some: { regionId: { in: managerRegions } } }
        },
        include: includeOptions,
        orderBy: { createdAt: 'desc' }
      });
    }

    // Map result for cleaner frontend use
    const result = users.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      role: u.role.name,
      isActive: u.isActive,
      regions: u.regionAccess.map(ra => ({
        id: ra.region.id,
        code: ra.region.code,
        name: ra.region.name
      }))
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[userController] Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy d/s người dùng.' });
  }
};

/**
 * Tạo tài khoản mới theo phân cấp
 */
const createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, roleName, regionIds } = req.body;
    const currentUserRole = req.user.role;

    // Phân quyền tạo
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'DIRECTOR' && currentUserRole !== 'MANAGER') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền tạo tài khoản.' });
    }

    if (currentUserRole === 'DIRECTOR' && !['MANAGER', 'EMPLOYEE'].includes(roleName)) {
      return res.status(403).json({ success: false, message: 'Giám đốc chỉ tạo được Trưởng phòng hoặc Nhân viên.' });
    }

    if (currentUserRole === 'MANAGER' && roleName !== 'EMPLOYEE') {
      return res.status(403).json({ success: false, message: 'Trưởng phòng chỉ tạo được Nhân viên.' });
    }

    // Lấy Role ID
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ.' });

    // Validate DB Unique
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại.' });

    // Lọc Regions (nếu là Manager, chỉ được gán region giống mình)
    let assignedRegions = regionIds || [];
    if (currentUserRole === 'MANAGER') {
      assignedRegions = req.user.regionAccess.map(ra => ra.regionId);
    }

    // Tạo User
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fullName,
        email,
        roleId: role.id,
        isActive: true,
        regionAccess: {
          create: assignedRegions.map(rid => ({ regionId: rid }))
        }
      },
      include: {
        role: true,
        regionAccess: { include: { region: true } }
      }
    });

    res.json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role.name,
        regions: newUser.regionAccess.map(ra => ra.region)
      }
    });
  } catch (error) {
    console.error('[userController] Error creating user:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo người dùng.' });
  }
};

/**
 * Cập nhật vai trò và khu vực của người dùng
 */
const updatePermissions = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { roleName, regionIds, isActive } = req.body;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'DIRECTOR') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật phân quyền.' });
    }

    const dataToUpdate = {};
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    if (roleName) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (role) dataToUpdate.roleId = role.id;
    }

    // Update User main details
    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    // Cập nhật Vùng truy cập
    if (regionIds && Array.isArray(regionIds)) {
      // Xóa tất cả quyền vùng cũ
      await prisma.userRegionAccess.deleteMany({ where: { userId } });
      // Thêm lại
      if (regionIds.length > 0) {
        await prisma.userRegionAccess.createMany({
          data: regionIds.map(rid => ({ userId, regionId: rid }))
        });
      }
    }

    res.json({ success: true, message: 'Cập nhật phân quyền thành công.' });
  } catch (error) {
    console.error('[userController] Error updating permissions:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật phân quyền.' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updatePermissions
};
