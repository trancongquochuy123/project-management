const Role = require('../../models/role.model');
const Permission = require('../../models/permission.model');

const systemConfig = require("../../config/system");

// [GET] admin/dashboard
module.exports.index = async (req, res) => {
    let findRoles = {
        deleted: false,
    };

    const records = await Role.find(findRoles);

    res.render("admin/pages/roles/index.pug", {
        pageTitle: "Roles",
        description: "Manage roles in the admin panel",
        records: records
    });
}

// [GET] admin/roles/create
module.exports.create = (req, res) => {
    res.render("admin/pages/roles/create.pug", {
        pageTitle: "Create Role",
        description: "Create a new role for the admin panel",
    });
}

// [POST] admin/roles/create
module.exports.createRole = async (req, res) => {
    try {
        const title = req.body.title;
        const description = req.body.description;

        // Validate input
        if (!title) {
            req.flash('error', 'Title is required');
            return res.redirect(`${systemConfig.prefixAdmin}/roles/create`);
        }

        // Create new role
        const newRole = new Role({
            title,
            description,
        });

        await newRole.save();

        req.flash('success', 'Role created successfully');
        return res.redirect(`${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        console.error("Error creating role:", error);
        req.flash('error', 'An error occurred while creating the role');
        return res.redirect(`${systemConfig.prefixAdmin}/roles/create`);
    }
};

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const find = {
            _id: id,
            deleted: false,
        };

        const data = await Role.findOne(find);

        if (!data) {
            req.flash('error', 'Role not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/roles`);
        }

        res.render("admin/pages/roles/edit.pug", {
            pageTitle: "Edit Role",
            description: "Edit an existing records category",
            record: data,
        });
    } catch (error) {
        console.error("❌  [ERROR in edit controller]", error);
        req.flash('error', 'An error occurred while loading edit page.');
        res.redirect(`${systemConfig.prefixAdmin}/roles`); // redirect về trang danh sách sản phẩm
    }
};

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;
        const find = {
            _id: id,
            deleted: false,
        };

        const data = await Role.findOne(find);
        if (!data) {
            req.flash('error', 'Role not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/roles`);
        }

        const { title, description } = req.body;

        const roleData = {
            title,
            description
        };

        await Role.updateOne(find, roleData);

        req.flash('success', 'Update Role successfully!');
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        console.error("❌  [ERROR in editPatch controller]", error);
        req.flash('error', 'An error occurred while updating the role.');
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
};
// [GET] admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const find = { _id: id, deleted: false };

        const data = await Role.findOne(find);
        if (!data) {
            req.flash('error', 'Role not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/roles`);
        }

        res.render("admin/pages/roles/detail.pug", {
            pageTitle: "Role Details",
            description: "View Role details",
            record: data,
        });
    } catch (error) {
        console.error("❌  [ERROR in detail controller]", error);
        req.flash('error', 'An error occurred while loading Role details.');
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
};

// [DELETE] admin/roles/delete/:id
module.exports.deleteRole = async (req, res) => {
    try {
        const id = req.params.id;

        await Role.findByIdAndUpdate(id, {
            deleted: true,
            deletedAt: new Date()
        });

        req.flash('success', 'Delete role successfully!');

        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        console.error("Error in delete item:", error);
        req.flash('error', 'An error occurred while deleting the role.');
        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/roles`);
    }
}


// [GET] admin/roles/permissions
/**
 * Hiển thị ma trận phân quyền: rows là permission, columns là roles
 */
module.exports.permissions = async (req, res) => {
  try {
    // Lấy danh sách tất cả permissions từ database, đã sắp xếp theo nhóm và key
    const allPermissions = await Permission.find()
      .sort({ group: 1, key: 1 })
      .lean();

    // Lấy tất cả roles (chưa xóa)
    const roles = await Role.find({ deleted: false }).lean();

    res.render('admin/pages/roles/permission.pug', {
      pageTitle: 'Role Permissions',
      description: 'View Role Permissions',
      roles,
      allPermissions
    });
  } catch (error) {
    console.error('❌  [ERROR in permission controller]', error);
    req.flash('error', 'An error occurred while loading Role Permissions.');
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

// controllers/admin/role.controller.js

module.exports.updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    // Lấy tất cả roles để update
    const roles = await Role.find({ deleted: false });
    
    // Cập nhật permissions cho từng role
    for (const role of roles) {
      const roleId = role._id.toString();
      
      // Lấy permissions mới cho role này từ form data
      const newPermissions = permissions[roleId] || [];
      
      // Cập nhật permissions cho role
      await Role.updateOne(
        { _id: roleId },
        { 
          permissions: newPermissions,
          updatedAt: new Date()
        }
      );
      
      console.log(`✅ Updated permissions for role: ${role.title}`);
      console.log(`   New permissions: ${newPermissions.join(', ')}`);
    }
    
    req.flash('success', 'Cập nhật phân quyền thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
    
  } catch (error) {
    console.error('❌ [ERROR in updatePermissions controller]', error);
    req.flash('error', 'Có lỗi xảy ra khi cập nhật phân quyền!');
    res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
  }
};

// Phiên bản chi tiết hơn với validation và logging
module.exports.updatePermissionsAdvanced = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    // Validation: Kiểm tra permissions có tồn tại
    if (!permissions || typeof permissions !== 'object') {
      req.flash('error', 'Dữ liệu phân quyền không hợp lệ!');
      return res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
    }
    
    // Lấy tất cả permissions hợp lệ từ database
    const validPermissions = await Permission.find().select('key').lean();
    const validPermissionKeys = validPermissions.map(p => p.key);
    
    // Lấy tất cả roles
    const roles = await Role.find({ deleted: false });
    
    const updateResults = [];
    
    // Cập nhật permissions cho từng role
    for (const role of roles) {
      const roleId = role._id.toString();
      
      // Lấy permissions mới cho role này từ form data
      let newPermissions = permissions[roleId] || [];
      
      // Ensure newPermissions is an array
      if (!Array.isArray(newPermissions)) {
        newPermissions = [newPermissions];
      }
      
      // Validation: Chỉ giữ lại permissions hợp lệ
      const filteredPermissions = newPermissions.filter(perm => 
        validPermissionKeys.includes(perm)
      );
      
      // Cập nhật permissions cho role
      const updateResult = await Role.updateOne(
        { _id: roleId },
        { 
          permissions: filteredPermissions,
          updatedAt: new Date()
        }
      );
      
      updateResults.push({
        roleId: roleId,
        roleName: role.title,
        oldPermissions: role.permissions,
        newPermissions: filteredPermissions,
        updated: updateResult.modifiedCount > 0
      });
      
      console.log(`✅ Updated permissions for role: ${role.title}`);
      console.log(`   Old permissions: ${role.permissions.join(', ')}`);
      console.log(`   New permissions: ${filteredPermissions.join(', ')}`);
    }
    
    // Log kết quả cập nhật
    console.log('📊 Permission update summary:');
    updateResults.forEach(result => {
      console.log(`   ${result.roleName}: ${result.updated ? 'Updated' : 'No changes'}`);
    });
    
    req.flash('success', `Cập nhật phân quyền thành công cho ${updateResults.filter(r => r.updated).length} vai trò!`);
    res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
    
  } catch (error) {
    console.error('❌ [ERROR in updatePermissions controller]', error);
    req.flash('error', 'Có lỗi xảy ra khi cập nhật phân quyền!');
    res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
  }
};

// Phiên bản với transaction để đảm bảo tính toàn vẹn dữ liệu
module.exports.updatePermissionsWithTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { permissions } = req.body;
      
      // Validation
      if (!permissions || typeof permissions !== 'object') {
        throw new Error('Dữ liệu phân quyền không hợp lệ!');
      }
      
      // Lấy tất cả permissions hợp lệ
      const validPermissions = await Permission.find().select('key').lean().session(session);
      const validPermissionKeys = validPermissions.map(p => p.key);
      
      // Lấy tất cả roles
      const roles = await Role.find({ deleted: false }).session(session);
      
      // Cập nhật permissions cho từng role
      for (const role of roles) {
        const roleId = role._id.toString();
        let newPermissions = permissions[roleId] || [];
        
        // Ensure array format
        if (!Array.isArray(newPermissions)) {
          newPermissions = [newPermissions];
        }
        
        // Filter valid permissions
        const filteredPermissions = newPermissions.filter(perm => 
          validPermissionKeys.includes(perm)
        );
        
        // Update role
        await Role.updateOne(
          { _id: roleId },
          { 
            permissions: filteredPermissions,
            updatedAt: new Date()
          },
          { session }
        );
      }
    });
    
    req.flash('success', 'Cập nhật phân quyền thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
    
  } catch (error) {
    console.error('❌ [ERROR in updatePermissions controller]', error);
    req.flash('error', error.message || 'Có lỗi xảy ra khi cập nhật phân quyền!');
    res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
  } finally {
    await session.endSession();
  }
};