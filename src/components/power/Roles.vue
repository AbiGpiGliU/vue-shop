<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row class="button-row">
        <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
      </el-row>
      <el-row>
        <el-table :data="rolesList" border style="width: 100%" stripe>
          <el-table-column type="expand" label="明细">
            <!-- 展开列 -->
            <template slot-scope="scope">
              <div class="expandedTable">
                <!-- 一级权限 -->
                <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="{ bdtop: i1 == 0, bdbottom: true }">
                  <el-col :span="5">
                    <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }} </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <!-- 二级权限 -->
                    <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="{ bdtop: i2 != 0 }">
                      <el-col :span="12">
                        <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">{{ item2.authName }} </el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <el-col :span="12">
                        <!-- 三级权限 -->
                        <el-tag v-for="item3 in item2.children" :key="item3.id" closable type="warning" @close="removeRightById(scope.row, item3.id)">{{ item3.authName }} </el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </div>
            </template>
          </el-table-column>
          <el-table-column type="index" label="序号"> </el-table-column>
          <el-table-column prop="roleName" label="角色名称"> </el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
          <el-table-column fixed="right" label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" @click="deleteRoleById(scope.row.id)">删除</el-button>
              <el-button type="warning" icon="el-icon-setting" @click="showRightsDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClosed">
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleFormRef" label-width="100px" show-message>
        <el-form-item label="角色名称" prop="roleName" required>
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" required>
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%" @close="editRoleDialogClosed">
      <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleFormRef" label-width="100px" show-message>
        <el-form-item label="角色名称" prop="roleName" required>
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" required>
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="rightsDialogVisible" width="50%" @close="rightsDialogClosed">
      <el-tree :data="rightsList" ref="treeRef" :default-checked-keys="defaultCheckedKeys" show-checkbox node-key="id" default-expand-all :props="rightsDefaultProps"> </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      addRoleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
      },
      editRoleDialogVisible: false,
      editRoleForm: {},
      editRoleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
      },
      rightsList: [],
      rightsDialogVisible: false,
      //树形组件配置
      rightsDefaultProps: {
        label: 'authName',
        children: 'children',
      },
      //默认选中节点的ID数组
      defaultCheckedKeys: [],
      //当前分配权限的角色id
      roleId: '',
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    //添加角色对话框关闭
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    //添加角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('/roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.addRoleDialogVisible = false
        this.$message.success('添加角色成功')
        this.getRolesList()
      })
    },
    //展示修改角色对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`/roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    //修改角色对话框关闭
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    //修改角色
    editRole() {
      this.$refs.editRoleFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`/roles/${this.editRoleForm.roleId}`, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.$message.success('修改角色成功')
        this.editRoleDialogVisible = false
        this.getRolesList()
      })
    },
    //删除角色
    deleteRoleById(id) {
      this.$confirm('确定要删除该角色吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`/roles/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色失败')
          }
          this.$message({
            type: 'success',
            message: '删除角色成功',
          })
          this.getRolesList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 展示分配权限对话框
    async showRightsDialog(role) {
      const { data: res } = await this.$http.get(`rights/tree`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      this.roleId = role.id
      this.getLeafNode(role)
      this.rightsDialogVisible = true
    },
    //分配权限对话框关闭
    rightsDialogClosed() {
      this.defaultCheckedKeys = []
      this.roleId = ''
    },
    //获取叶节点
    getLeafNode(node) {
      //如果是叶节点，则将叶节点id加入数组
      if (!node.children) {
        return this.defaultCheckedKeys.push(node.id)
      }
      //如果不是叶节点，则递归
      node.children.forEach((item) => {
        this.getLeafNode(item)
      })
    },
    //分配权限
    async allotRights() {
      const keys = this.$refs.treeRef.getCheckedKeys().concat(this.$refs.treeRef.getHalfCheckedKeys())
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.rightsDialogVisible = false
    },
    //删除权限
    removeRightById(role, rightId) {
      this.$confirm('确定要删除该权限吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除权限失败')
          }
          // this.getRolesList() 不建议重新获取所有角色列表，会导致页面刷新
          role.children = res.data //重新设置当前角色下最新的权限数据
          this.$message.success('删除权限成功')
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
  },
}
</script>

<style scoped lang="less">
.el-breadcrumb {
  margin-bottom: 10px;
}
.el-card {
  .button-row {
    margin-bottom: 10px;
  }
}
.expandedTable {
  margin: 0 10px;
  .el-row {
    display: flex;
    align-items: center;
  }
  .el-tag {
    margin: 6px;
  }
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>