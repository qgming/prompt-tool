// 工具定义类型 - 完全兼容OpenAI标准
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description: string;
      }>;
      required: string[];
    };
  };
}

// 工具执行结果
export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// 工具执行上下文 - 用于依赖注入
export interface ToolExecutionContext {
  getResource: <T>(key: string) => T;
  hasResource: (key: string) => boolean;
}

// 工具执行器接口
export interface ToolExecutor {
  execute(args: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolExecutionResult>;
}

// 工具元数据
export interface ToolMetadata {
  name: string;
  description: string;
  version: string;
  category: string;
}

// 完整工具接口
export interface Tool {
  metadata: ToolMetadata;
  definition: ToolDefinition;
  executor: ToolExecutor;
}

// 工具注册表接口
export interface ToolRegistry {
  register(tool: Tool): void;
  unregister(name: string): void;
  get(name: string): Tool | undefined;
  getAll(): Tool[];
  getDefinitions(): ToolDefinition[];
  has(name: string): boolean;
}
