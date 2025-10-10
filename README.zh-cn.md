# 资产营销工作室 (Asset Marketing Studio)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-v2.0-brightgreen.svg)](../CODE_OF_CONDUCT.md)

一个现代化的、响应式的资产营销平台，旨在帮助企业展示和管理其数字资产。

## ✨ 特性

- 🎨 **现代化设计** - 采用最新的UI/UX设计原则
- 📱 **响应式布局** - 完美适配各种设备尺寸
- ⚡ **高性能** - 基于Next.js构建，提供卓越的性能
- 🌍 **国际化** - 支持多语言
- 🎯 **SEO优化** - 内置搜索引擎优化功能
- 🔧 **可定制** - 高度可定制的组件和主题

## 🚀 快速开始

### 前置要求

- Node.js 18.0 或更高版本
- npm 或 yarn

### 安装

1. 克隆仓库：
```bash
git clone https://github.com/asset-io/asset-marketing-studio.git
cd asset-marketing-studio
```

2. 安装依赖：
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器：
```bash
npm run dev
# 或
yarn dev
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 📁 项目结构

```
asset-marketing-studio/
├── docs/                  # 文档
├── public/                # 静态资源
├── src/
│   ├── app/              # App Router 组件
│   ├── components/       # 可复用组件
│   │   ├── sections/     # 页面部分组件
│   │   └── ui/           # UI组件
│   └── types/            # TypeScript 类型定义
├── .github/              # GitHub 配置文件
└── package.json          # 项目配置
```

## 🛠️ 技术栈

- **框架**: [Next.js 14](https://nextjs.org/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **包管理**: [npm](https://www.npmjs.com/)

## 📖 文档

- [开发指南](./docs/DEVELOPMENT.md) - 如何设置开发环境
- [API 文档](./docs/API.md) - API 参考文档
- [部署指南](./docs/DEPLOYMENT.md) - 部署说明
- [设计系统](./docs/DESIGN_SYSTEM.md) - UI/UX 指南

## 🎨 组件

### 页面部分

- **导航** (`Navigation`) - 网站导航栏
- **主页** (`Hero`) - 主页横幅区域
- **解决方案** (`Solutions`) - 解决方案展示
- **优势** (`Benefits`) - 产品优势介绍
- **流程** (`Process`) - 工作流程说明
- **评价** (`Testimonials`) - 客户评价
- **社交证明** (`SocialProof`) - 社交证明
- **定价** (`Pricing`) - 定价方案
- **常见问题** (`FAQ`) - 常见问题解答
- **行动号召** (`CTA`) - 行动号召区域
- **页脚** (`Footer`) - 网站页脚

### UI 组件

- **卡片** (`Card`) - 基础卡片组件
- **玻璃卡片** (`GlassCard`) - 玻璃态效果卡片
- **按钮** (`Button`) - 可定制按钮组件
- **手风琴** (`Accordion`) - 可折叠内容区域

## 🤝 贡献

我们欢迎所有形式的贡献！请查看我们的[贡献指南](../CONTRIBUTORS.md)了解如何参与项目。

### 贡献方式

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 开发脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行代码检查
npm run lint

# 运行测试
npm test
```

## 🌐 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情。

## 🆘 支持

如果您遇到任何问题或有任何疑问，请：

1. 查看[文档](./docs/README.md)
2. 搜索[已有问题](https://github.com/asset-io/asset-marketing-studio/issues)
3. 创建新问题
4. 联系我们的支持团队

查看我们的[支持指南](../.github/SUPPORT.md)了解更多信息。

## 🔒 安全

如果您发现安全漏洞，请不要在公共问题中报告。请发送邮件至 security@asset.io。

查看我们的[安全政策](../SECURITY.md)了解更多信息。

## 🌟 致谢

感谢所有为这个项目做出贡献的人！

## 📞 联系我们

- **网站**: [asset.io](https://asset.io)
- **邮箱**: info@asset.io
- **GitHub**: [@asset-io](https://github.com/asset-io)

---

**资产营销工作室** - 让您的数字资产管理更简单 🚀