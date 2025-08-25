# 消息监控器使用指南

## 功能概述

`MessageMonitor` 是一个 TypeScript 类，用于实时监控 API 响应并自动处理工具调用。当检测到包含工具调用的消息时，它会自动执行相应的工具并将结果返回给 AI。

## 核心特性

- 🔍 **实时监控**：自动检测 `finish_reason: "tool_calls"` 的 API 响应
- ⚡ **自动执行**：自动调用并执行工具函数
- 🔄 **无缝集成**：与现有工具系统完全兼容
- 📊 **流式支持**：支持流式和非流式响应
- ⚙️ **灵活配置**：支持自定义模型设置

## 快速开始

### 1. 使用便捷函数

```typescript
import { monitorAndProcessMessage } from "./lib/messageMonitor";

// 处理单条消息
await monitorAndProcessMessage(
  "张三是谁？",
  (chunk) => console.log(chunk) // 可选的流式回调
);
```

### 2. 使用类实例

```typescript
import { MessageMonitor } from "./lib/messageMonitor";

const monitor = new MessageMonitor();

// 检查配置
if (!monitor.isConfigured()) {
  console.error("请先配置API密钥");
  return;
}

// 处理消息
await monitor.processMessage(
  [{ role: "user", content: "李四的年龄是多少？" }],
  (chunk) => console.log(chunk) // 可选的流式回调
);
```

## 使用示例

### 基本用法

```typescript
// 自动处理工具调用
const response = await monitorAndProcessMessage("张三是谁？");
console.log(response); // 包含工具查询结果的完整回答
```

### 流式响应

```typescript
await monitorAndProcessMessage("王五的职业是什么？", (chunk) => {
  // 实时输出AI响应
  process.stdout.write(chunk);
});
```

### 批量消息处理

```typescript
const messages = [
  { role: "user", content: "告诉我关于张三的信息" },
  { role: "assistant", content: "我来为您查询张三的信息" },
];

await monitor.processMessage(messages);
```

## 配置说明

### 模型设置

监控器会自动从 localStorage 读取配置：

- `modelSettings`: API 配置（URL、密钥、模型名等）
- `systemPrompt`: 系统提示词

### 手动配置

```typescript
const monitor = new MessageMonitor();
monitor.updateConfig({
  apiKey: "your-api-key",
  modelName: "gpt-4",
  temperature: 0.7,
});
```

## 测试运行

### 运行测试

```bash
# 在项目根目录运行
npx tsx src/test-monitor.ts
```

### 测试内容

1. **工具调用测试**：查询人物信息（张三、李四等）
2. **类实例测试**：使用 MessageMonitor 类
3. **普通对话测试**：无工具调用的对话

## 错误处理

### 常见错误

- **API 未配置**：提示配置 API 密钥
- **无效 API 密钥**：显示认证错误信息
- **请求频率限制**：提示稍后重试
- **服务器错误**：显示服务端错误信息
