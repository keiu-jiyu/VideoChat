# WebRTC 视频聊天应用

一个基于 WebRTC、Socket.io 和 React 的实时视频聊天应用。

## 📋 功能特性

- ✅ 实时视频/音频通话
- ✅ 多房间支持
- ✅ 用户在线状态显示
- ✅ Material-UI 美观界面
- ✅ 自动连接管理
- ✅ 优雅的错误处理

## 🛠 技术栈

### 前端
- **React** - UI 框架
- **Simple-peer** - WebRTC 封装库
- **Socket.io** - 实时通信
- **Material-UI** - UI 组件库
- **Vite** - 构建工具

### 后端
- **Express** - Web 框架
- **Socket.io** - 双向通信
- **CORS** - 跨域资源共享
- **Nodemon** - 开发工具

## 📦 安装

### 前置要求
- Node.js >= 14.0.0
- npm 或 yarn

### 克隆项目
```bash
git clone https://github.com/yourusername/webrtc-demo.git
cd webrtc-demo
```

## 🚀 快速开始

### 1. 启动服务器

```bash
cd server
npm install
npm run dev
```

服务器将在 `http://localhost:5000` 运行

### 2. 启动客户端（新终端）

```bash
cd client
npm install
npm run dev
```

客户端将在 `http://localhost:5173` 运行

## 📖 使用说明

1. **打开应用**
   - 访问 `http://localhost:5173`

2. **加入房间**
   - 输入房间号（如：`room123`）
   - 输入用户名（如：`Alice`）
   - 点击"进入房间"按钮

3. **邀请他人**
   - 将房间号分享给另一个用户
   - 另一个用户输入相同房间号加入

4. **开始通话**
   - 双方都加入后，自动建立 WebRTC 连接
   - 允许浏览器访问摄像头和麦克风
   - 即可看到对方的视频画面

## 📁 项目结构
webrtc-demo/
├── server/
│   ├── package.json
│   ├── index.js              # 信令服务器
│   └── node_modules/
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx           # 主应用组件
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── components/
│   │       └── VideoChat.jsx # 视频聊天组件
│   └── node_modules/
└── README.md

## 🔧 配置说明

### 后端配置 (server/index.js)

```javascript
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
```

### 前端配置 (client/src/components/VideoChat.jsx)

```javascript
const SOCKET_SERVER = 'http://localhost:5000';
```

## 🌐 部署指南

### 部署到 Heroku

#### 后端
```bash
# 1. 创建 Heroku 应用
heroku create your-app-name

# 2. 设置环境变量
heroku config:set CORS_ORIGIN=https://your-frontend-url.com

# 3. 推送代码
git push heroku main
```

#### 前端
```bash
# 使用 Vercel 部署
npm i -g vercel
vercel

# 或使用 Netlify
npm run build
# 将 dist 文件夹上传到 Netlify
```

## 📝 环境变量

创建 `.env` 文件（如需要）

### server/.env
```
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### client/.env
```
VITE_SOCKET_SERVER=http://localhost:5000
```

## 🐛 常见问题

### Q: 无法访问摄像头？
**A:** 
- 确保使用 HTTPS 或 localhost
- 检查浏览器权限设置
- 在 Chrome 中：设置 → 隐私设置和安全性 → 摄像头

### Q: 连接超时？
**A:**
- 确保后端服务器运行在 5000 端口
- 检查防火墙设置
- 查看浏览器控制台错误信息

### Q: 只能看到自己的视频？
**A:**
- 检查两个用户是否在同一房间
- 确保都允许了摄像头访问权限
- 刷新页面重试

### Q: 如何在局域网内使用？
**A:**
- 修改前端配置，使用服务器的 IP 地址
- 例如：`http://192.168.1.100:5000`
- 确保防火墙允许 5000 端口

## 🔐 安全建议

- [ ] 生产环境使用 HTTPS
- [ ] 添加房间密码验证
- [ ] 实现用户身份认证
- [ ] 添加请求速率限制
- [ ] 使用环境变量管理敏感信息
- [ ] 定期更新依赖包

## 📊 性能优化

- 启用视频压缩
- 调整分辨率：360p/720p
- 启用编码优化
- 监控内存使用

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件


---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
