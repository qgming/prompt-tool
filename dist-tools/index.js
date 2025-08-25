// 导出核心类型
export * from './core/types';
// 导出注册表
export { ToolRegistryImpl, globalToolRegistry } from './registry/ToolRegistryImpl';
// 导出工厂
export { ToolFactory } from './factory/ToolFactory';
// 导出执行器（供测试使用）
export { CharacterQueryExecutor } from './executors/CharacterQueryExecutor';
// 工具初始化函数
import { globalToolRegistry } from './registry/ToolRegistryImpl';
import { ToolFactory } from './factory/ToolFactory';
export function initializeTools() {
    // 注册所有可用工具
    globalToolRegistry.register(ToolFactory.createCharacterQueryTool());
    console.log('🛠️ 工具系统初始化完成');
    console.log('已注册工具:', globalToolRegistry.getAvailableTools());
}
// 自动初始化
initializeTools();
