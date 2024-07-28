<template>
<div id = "background">
  <div class="login">
    <h2>登录</h2>
    <form @submit.prevent="login">
      <div>
        <label for="name">用户名:</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div>
        <label for="password">密码:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div>
        <label for="permission">身份:</label>
        <select id="permission" v-model="permission">
          <option value="0">老师</option>
          <option value="1">学生</option>
          <option value="2">管理员</option>
        </select>
      </div>
      <button type="submit">登录</button>
    </form>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'UserLogin',
  data() {
    return {
      name: '',
      password: '',
      permission: '0',
      errorMessage: ''
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          name: this.name,
          password: this.password,
          permission: this.permission
        });

        if (response.data.success) {
          let targetPath;
          if (this.permission === '0') {
            targetPath = '/home';
          } else if (this.permission === '1') {
            targetPath = '/home';
          } else if (this.permission === '2') {
            targetPath = '/home';
          }

          this.router.push({
            path: targetPath,
            query: {
              name: this.name,
              permission: this.permission
            }
          });
        } else {
          this.errorMessage = '用户名或密码错误，或身份不符';
        }
      } catch (error) {
        this.errorMessage = '服务器错误，请稍后再试';
      }
    }
  }
};
</script>

<style scoped>
#background {
  background-image: url('@/assets/login.png'); /* 设置背景图片路径 */
  background-size: cover; /* 使背景图片覆盖整个元素 */
  background-position: center; /* 背景图片居中对齐 */
  background-repeat: no-repeat; /* 不重复背景图片 */
  position: absolute; /* 或使用 fixed，以确保覆盖整个屏幕 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%
}
.login {
  position: absolute; /* 绝对定位 */
  top: 50%; /* 距离顶部 50% */
  left: 50%; /* 距离左边 50% */
  transform: translate(-50%, -50%); /* 将自身的中心对齐到视口中心 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  background-color: rgba(245, 245, 245, 0.8); /* 设置背景色 */
  padding: 20px; /* 添加内边距 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 添加阴影以突出显示 */
  border-radius: 8px; /* 添加圆角 */
  max-width: 400px; /* 限制最大宽度 */
  width: 100%; /* 确保宽度填满容器 */
  max-height: 80vh; /* 限制最大高度 */
}

.login h2 {
  font-weight: bold;
  margin-bottom: 20px; /* 添加标题和表单之间的间距 */
}

.login form {
  width: 100%; /* 使表单宽度为 100% */
}

.login div {
  margin-bottom: 15px; /* 表单元素之间的间距 */
}

.login label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px; /* 标签和输入框之间的间距 */
}

.login input, 
.login select {
  width: 90%; /* 将宽度调整为 80% */
  max-width: 400px; /* 设置最大宽度 */
  padding: 8px; /* 减少内边距 */
  border: 1px solid #ccc; /* 边框颜色 */
  border-radius: 4px; /* 圆角边框 */
}

.login button {
  padding: 10px 20px;
  border: none;
  display:block;
  margin:0 auto;
  border-radius: 4px;
  font-weight: bold;
  background-color: #64C9AF; /* 修改按钮背景色为绿色 */
  color: #fff; /* 按钮文字颜色 */
  cursor: pointer; /* 鼠标悬停时的光标样式 */
}

.login button:hover {
  background-color: #6DE4C6; /* 修改按钮悬停时的背景色 */
}
.login select {
  width: 90%; /* 将宽度调整为 90% */
  max-width: 400px; /* 设置最大宽度 */
  padding: 8px; /* 内边距 */
  border: 1px solid #ccc; /* 边框颜色 */
  border-radius: 4px; /* 圆角边框 */
  background-color: #ffffff; /* 设置背景色为白色 */
  color: #000000; /* 设置字体颜色为黑色 */
}
.login option {
  background-color: #ffffff; /* 设置选项背景色为白色 */
  color: #000000; /* 设置选项字体颜色为黑色 */
}

.error {
  color: red; /* 错误信息颜色 */
  margin-top: 15px; /* 错误信息和表单之间的间距 */
}
</style>
