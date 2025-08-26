# AI 提示词对比工具 (Prompt Comparison Tool)

一个基于 React 和 OpenAI API 的现代化提示词效果对比工具，支持实时双栏对话对比，帮助用户快速评估和优化 AI 系统提示词。

## 🌟 核心功能

### 🔄 双栏实时对比

- **并排对话展示** - 同时显示两个 AI 助手的回复
- **同步消息发送** - 一次输入，同时发送到两个对话区域
- **独立状态管理** - 每个对话区域独立加载、错误处理

### 🎯 提示词管理

- **双提示词配置** - 为每个对话区域设置不同的系统提示词
- **实时编辑** - 支持运行时修改提示词并立即生效
- **本地存储** - 提示词配置自动保存到浏览器本地存储

### 🛠️ 智能工具集成

- **MCP 工具系统** - 基于 OpenAI Function Calling 的模块化工具架构
- **自动工具调用** - AI 自动识别何时使用工具获取准确信息

### ⚙️ 灵活配置

- **多模型支持** - 支持 OpenAI GPT-4、GPT-3.5-turbo 等模型
- **自定义 API** - 支持自定义 API 端点和密钥
- **参数调节** - 可调节 temperature、top_p 等生成参数
- **实时状态监控** - 显示 API 调用状态、工具使用情况

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- npm 或 yarn
- OpenAI API 密钥

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/qgming/prompt-tool.git
cd prompt-tool
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境**

   - 启动开发服务器：`npm run dev`
   - 打开浏览器访问 `http://localhost:5173`
   - 点击右上角设置按钮配置 OpenAI API 密钥

4. **开始使用**
   - 在设置面板中配置两个不同的系统提示词
   - 在底部输入框输入问题
   - 观察两个 AI 助手的不同回复效果

## 🏗️ 技术架构

### 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式方案**: TailwindCSS
- **HTTP 客户端**: OpenAI SDK
- **状态管理**: React Hooks + LocalStorage
- **开发语言**: TypeScript 5.9

### 项目结构

```
prompt-tool/
├── src/
│   ├── components/          # React组件
│   │   ├── ComparisonChatArea.tsx  # 主对话区域
│   │   ├── ChatColumn.tsx          # 单个对话栏
│   │   ├── SettingsPanel.tsx       # 设置面板
│   │   ├── PromptSettings.tsx      # 提示词配置
│   │   ├── ModelSettings.tsx       # 模型配置
│   │   ├── SharedInputArea.tsx     # 共享输入区域
│   │   └── StatusPanel.tsx         # 状态监控
│   ├── lib/                 # 核心逻辑
│   │   ├── chat.ts          # OpenAI API集成
│   │   ├── statusEvents.ts  # 状态事件管理
│   │   └── utils.ts         # 工具函数
│   ├── data/               # 数据文件
│   │   └── characters.json # 人物信息数据库
│   ├── tools.ts            # MCP工具定义
│   └── App.tsx             # 应用入口
├── dist-tools/             # 工具构建输出
├── public/                 # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🔧 配置说明

### 模型设置

```typescript
interface ModelSettings {
  apiUrl: string; // API端点，默认：https://api.openai.com/v1/chat/completions
  apiKey: string; // OpenAI API密钥
  modelName: string; // 模型名称，如：gpt-4, gpt-3.5-turbo
  temperature: number; // 生成温度，范围：0-2
  topP: number; // 核采样参数，范围：0-1
}
```

### 系统提示词

支持两个独立的系统提示词配置：

- **提示词 A** - 左侧对话区域的系统指令
- **提示词 B** - 右侧对话区域的系统指令

### 内置工具

- **get_character_info** - 查询人物详细信息
  - 支持人物：张三、李四、王五、赵六、孙七
  - 返回信息：年龄、职业、背景、性格特征

## 📊 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint

# 预览构建结果
npm run preview
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 组件采用函数式编程风格
- 使用 TailwindCSS 进行样式管理

## 🙋‍♂️ 问题反馈

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/qgming/prompt-tool/issues)
- 发送邮件至项目维护者

---

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**
