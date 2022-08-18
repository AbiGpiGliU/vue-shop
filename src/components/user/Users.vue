<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20" class="search-row">
        <el-col :span="8">
          <el-input placeholder="请输入搜索姓名" v-model="queryInfo.query" clearable @clear="getUserlist">
            <el-button slot="append" icon="el-icon-search" @click="getUserlist"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-row class="table-row">
        <el-table :data="users" border style="width: 100%" stripe>
          <el-table-column type="index" label="序号"> </el-table-column>
          <el-table-column prop="username" label="姓名"> </el-table-column>
          <el-table-column prop="email" label="邮箱"> </el-table-column>
          <el-table-column prop="mobile" label="电话"> </el-table-column>
          <el-table-column prop="role_name" label="角色"> </el-table-column>
          <el-table-column prop="mg_state" label="状态">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" active-color="#409eff" inactive-color="#dcdfe6" @change="changeUserState(scope)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作">
            <template slot-scope="scope">
              <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                <el-button @click="handleEditClick(scope.row.id)" type="primary" size="small" icon="el-icon-edit"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDeleteClick(scope.row.id)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" size="small" icon="el-icon-setting" @click="handleRoleClick(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialogVisible" width="50%" @close="AddUserDialogClosed">
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserFormRef" label-width="100px" show-message>
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input v-model="addUserForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" required>
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile" required>
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editUserDialogVisible" width="50%" @close="editUserDialogClosed">
      <el-form :model="editUserForm" :rules="editUserRules" ref="editUserFormRef" label-width="100px" show-message>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" required>
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile" required>
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="50%" @close="roleDialogClosed">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select placeholder="请选择" v-model="selectedRoleId">
            <el-option v-for="role in roleList" :key="role.id" :label="role.roleName" :value="role.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      //用户列表
      users: [],
      //用户总数
      total: 0,
      //控制添加用户对话框
      addUserDialogVisible: false,
      //添加用户表单
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //添加用户校验规则
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            pattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
            message: '邮箱格式不正确',
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
            message: '手机号格式不正确',
            trigger: 'blur',
          },
        ],
      },
      //控制修改用户对话框
      editUserDialogVisible: false,
      //编辑用户表单
      editUserForm: {},
      // 编辑用户校验规则
      editUserRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            pattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
            message: '邮箱格式不正确',
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
            message: '手机号格式不正确',
            trigger: 'blur',
          },
        ],
      },
      //控制分配角色对话框
      roleDialogVisible:false,
      //分配角色用户信息
      userInfo:{},
      //角色列表
      roleList:[],
      //选择的角色id
      selectedRoleId:null,
    }
  },
  created() {
    this.getUserlist()
  },
  methods: {
    //获取用户列表
    async getUserlist() {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.users = res.data.users
      this.total = res.data.total
    },
    //用户状态改变
    async changeUserState(userInfo) {
      const { data: res } = await this.$http.put(`/users/${userInfo.row.id}/state/${userInfo.row.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.row.mg_state = !userInfo.row.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    //pagesize改变
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUserlist()
    },
    //pagenum改变
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserlist()
    },
    //关闭添加用户对话框
    AddUserDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    //添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('/users', this.addUserForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addUserDialogVisible = false
        this.getUserlist()
      })
    },
    //修改用户对话框打开
    async handleEditClick(id) {
      const { data: res } = await this.$http.get(`/users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editUserForm = res.data
      this.editUserDialogVisible = true
    },
    // 修改用户对话框关闭
    editUserDialogClosed() {
      this.$refs.editUserFormRef.resetFields()
    },
    //修改用户
    editUser() {
      this.$refs.editUserFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`/users/${this.editUserForm.id}`, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户失败')
        }
        this.editUserDialogVisible = false
        this.getUserlist()
        this.$message.success('修改用户成功')
      })
    },
    //删除用户
    handleDeleteClick(id) {
      this.$confirm('确定要删除该用户吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`/users/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          this.getUserlist()
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    //分配角色对话框打开
    async handleRoleClick(userInfo){
      this.userInfo = userInfo
      const {data:res} = await this.$http.get('/roles')
      if(res.meta.status !== 200){
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      this.roleDialogVisible = true
    },
    //分配角色对话框关闭
    roleDialogClosed(){
      this.selectedRoleId = null
      this.userInfo = {}
    },
    //分配角色
    async allotRole(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择角色')
      }
      const {data:res} = await this.$http.put(`/users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
      if(res.meta.status !== 200){
        return this.$message.error('分配角色失败')
      }
      this.roleDialogVisible = false
      this.$message.success('分配角色成功')
      this.getUserlist()
    }
  },
}
</script>

<style scoped lang="less">
.el-breadcrumb {
  margin-bottom: 10px;
}
.el-card {
  .search-row {
    margin-bottom: 10px;
  }
  .table-row {
    margin-bottom: 10px;
  }
}
</style>