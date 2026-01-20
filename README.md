# Web 数独解题工具 (Web Sudoku Solver)

一个现代化的、基于 Web 的数独解题工具，支持图片识别、自动解题和步骤演示。

## ✨ 核心功能

- **📸 图片识别 (OCR)**: 支持上传图片或拍照，自动识别数独题目（基于 Tesseract.js）。
- **✏️ 智能校正**: 提供直观的校正界面，允许用户手动修改识别结果。
- **🧩 自动解题**: 内置回溯法解题引擎，毫秒级求解。
- **▶️ 过程演示**: 可视化展示解题步骤，支持播放、暂停、调节速度。
- **📱 响应式设计**: 完美适配桌面和移动端设备。

## 🛠️ 技术栈

- **前端框架**: [Next.js 14+](https://nextjs.org/) (App Router)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式方案**: [Tailwind CSS 4](https://tailwindcss.com/)
- **图标库**: [Lucide React](https://lucide.dev/)
- **OCR 引擎**: [Tesseract.js](https://tesseract.projectnaptha.com/)

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
# 或者
pnpm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📦 部署

本项目配置为可直接部署到 Vercel。

1. Fork 本仓库
2. 在 Vercel 中导入项目
3. 点击 Deploy 即可

## 📝 目录结构

```
app/              # Next.js 页面路由
components/       # React 组件
hooks/            # 自定义 Hooks
lib/              # 工具函数和常量
services/         # 业务服务 (OCR)
types/            # 类型定义
```

## ⚠️ 注意事项

- OCR 识别准确率依赖于图片清晰度和光照。
- 当前版本使用纯前端 OCR，首次加载模型可能需要几秒钟。
