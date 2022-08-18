<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-form">
        <h1>Hello</h1>
        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="100px" size="mini" hide-required-asterisk>
          <el-form-item label="用户名：" prop="name" show-message>
            <el-input v-model="loginForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码：" prop="password" show-message>
            <el-input v-model="loginForm.password" show-password></el-input>
          </el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        //校验不通过直接返回
        if (!valid) {
          return
        }
        //post请求
        const { data: res } = await this.$http.post('login', this.loginForm)
        //登陆失败
        if (res.meta.status !== 200) {
          console.log(res.meta.status)
          return this.$message.error('登陆失败！')
        }
        //登录成功
        this.$message.success('登录成功')

        sessionStorage.setItem('userInfo', JSON.stringify(res.data))

        this.$router.push('/home')
      })
    },
  },
}
</script>

<style scoped lang="less">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  .login-content {
    width: 400px;
    height: 300px;
    border: 1px solid black;
    .login-form {
      width: 400px;
      height: 100%;
      h1 {
        text-align: center;
      }
      .el-form {
        margin-right: 100px;
        .el-form-item {
          margin-top: 30px;
        }
        .el-button {
          margin-left: 100px;
          margin-top: 20px;
          width: 200px;
        }
      }
    }
  }
}
</style>