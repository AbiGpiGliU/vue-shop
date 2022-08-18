<template>
  <el-container>
    <el-header>
      <div class="header-left">
        <span>电商后台管理系统</span>
      </div>
      <div class="header-right">
        <span>欢迎您：{{ userInfo.username }}</span>
        <el-button type="danger" size="mini">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu :unique-opened="true" :collapse-transition="false" :router="true" :default-active="$route.path">
          <el-submenu :index="menuItem.id + ''" v-for="menuItem in menuList" :key="menuItem.id">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{ menuItem.authName }}</span>
            </template>
            <el-menu-item :index="'/' + item.path" v-for="item in menuItem.children" :key="item.id">{{ item.authName }}</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    this.getMenuList()
  },
  methods: {
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
    },
  },
}
</script>

<style scoped lang="less">
.el-container {
  height: 100%;
  .el-header {
    height: 44px;
    // line-height: 44px;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-left {
      span {
        font-size: 22px;
      }
    }
    .header-right {
      span {
        font-size: 22px;
      }
      .el-button {
        margin-left: 20px;
      }
    }
  }
  .el-aside {
    .el-menu {
      border-right: 0;
    }
  }
  .el-main{
    background-color: #eee;
  }
}
</style>