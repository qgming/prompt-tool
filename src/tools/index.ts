// 导出核心类型
export * from './core/types';

// 导出实现
export { ToolRegistryImpl, globalToolRegistry } from './impl';
export { createCharacterQueryTool } from './impl';

// 工具初始化函数
import { globalToolRegistry, registerBuiltInTools } from './impl';

export function initializeTools(): void {
  registerBuiltInTools();
  console.log('🛠️ 工具系统初始化完成');
  console.log('已注册工具:', globalToolRegistry.getAvailableTools());
}

// 自动初始化
initializeTools();
