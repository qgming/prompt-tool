import type { Tool, ToolRegistry } from '../core/types';

export class ToolRegistryImpl implements ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    if (this.tools.has(tool.metadata.name)) {
      console.warn(`工具 ${tool.metadata.name} 已存在，将被覆盖`);
    }
    
    this.tools.set(tool.metadata.name, tool);
    console.log(`✅ 工具已注册: ${tool.metadata.name} (${tool.metadata.description})`);
  }

  unregister(name: string): void {
    if (this.tools.has(name)) {
      this.tools.delete(name);
      console.log(`🗑️ 工具已注销: ${name}`);
    }
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  getDefinitions() {
    return this.getAll().map(tool => tool.definition);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  getStats() {
    const tools = this.getAll();
    return {
      total: tools.length,
      tools: tools.map(tool => ({
        name: tool.metadata.name,
        category: tool.metadata.category,
        version: tool.metadata.version
      }))
    };
  }
}

// 创建全局单例
export const globalToolRegistry = new ToolRegistryImpl();
