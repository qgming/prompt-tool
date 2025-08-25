export class ToolRegistryImpl {
    constructor() {
        this.tools = new Map();
    }
    register(tool) {
        if (this.tools.has(tool.metadata.name)) {
            console.warn(`工具 ${tool.metadata.name} 已存在，将被覆盖`);
        }
        this.tools.set(tool.metadata.name, tool);
        console.log(`✅ 工具已注册: ${tool.metadata.name} (${tool.metadata.description})`);
    }
    unregister(name) {
        if (this.tools.has(name)) {
            this.tools.delete(name);
            console.log(`🗑️ 工具已注销: ${name}`);
        }
    }
    get(name) {
        return this.tools.get(name);
    }
    getAll() {
        return Array.from(this.tools.values());
    }
    getDefinitions() {
        return this.getAll().map(tool => tool.definition);
    }
    has(name) {
        return this.tools.has(name);
    }
    // 获取可用工具列表（用于调试）
    getAvailableTools() {
        return Array.from(this.tools.keys());
    }
    // 获取工具统计信息
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
