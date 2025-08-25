// 导出工具实现
export { createCharacterQueryTool } from './CharacterQueryTool';
export { ToolRegistryImpl, globalToolRegistry } from './ToolRegistry';

// 工具创建函数
import { globalToolRegistry } from './ToolRegistry';
import { createCharacterQueryTool } from './CharacterQueryTool';

// 注册所有内置工具
export function registerBuiltInTools(): void {
  globalToolRegistry.register(createCharacterQueryTool());
  console.log('🛠️ 内置工具注册完成');
}
