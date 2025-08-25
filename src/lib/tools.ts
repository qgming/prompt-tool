import type { ToolDefinition, ToolExecutionContext } from '../tools/core/types';
import { globalToolRegistry } from '../tools/impl';
import charactersData from '../data/characters.json';
import { createToolCallEvent } from './statusEvents';

// 工具执行结果（兼容旧格式）
export interface ToolResult {
  tool_call_id: string;
  content: string;
}

// 创建工具执行上下文
function createExecutionContext(): ToolExecutionContext {
  return {
    getResource: <T>(key: string): T => {
      switch (key) {
        case 'charactersData':
          return charactersData as T;
        default:
          throw new Error(`未知资源: ${key}`);
      }
    },
    hasResource: (key: string): boolean => {
      return key === 'charactersData';
    }
  };
}

// 获取所有工具定义（兼容旧格式）
export function getToolDefinitions(): ToolDefinition[] {
  return globalToolRegistry.getDefinitions();
}

// 检查工具是否存在
export function hasTool(name: string): boolean {
  return globalToolRegistry.has(name);
}

// 获取可用工具列表
export function getAvailableTools(): string[] {
  return globalToolRegistry.getAvailableTools();
}

// 执行工具调用（兼容旧格式）
export async function executeTool(toolCall: {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}): Promise<ToolResult> {
  console.group('🔧 工具执行详情（新架构）');
  console.log('工具调用ID:', toolCall.id);
  console.log('工具名称:', toolCall.function.name);
  console.log('工具参数:', toolCall.function.arguments);

  const tool = globalToolRegistry.get(toolCall.function.name);
  
  if (!tool) {
    const errorResult = {
      tool_call_id: toolCall.id,
      content: JSON.stringify({
        success: false,
        error: `未知工具：${toolCall.function.name}`,
        availableTools: getAvailableTools()
      })
    };
    
    console.error('❌ 工具未找到:', toolCall.function.name);
    console.groupEnd();
    
    // 发送工具调用失败事件
    createToolCallEvent({
      toolName: toolCall.function.name,
      arguments: {},
      status: 'failed',
      error: `未知工具：${toolCall.function.name}`
    });
    
    return errorResult;
  }

  try {
    const args = JSON.parse(toolCall.function.arguments);
    
    // 验证必需参数
    const requiredParams = tool.definition.function.parameters.required || [];
    for (const param of requiredParams) {
      if (!(param in args) || args[param] === undefined || args[param] === null || args[param] === '') {
        throw new Error(`缺少必需参数：${param}`);
      }
    }

    console.log('解析后的参数:', args);
    console.log('开始执行工具...');

    const startTime = Date.now();
    const context = createExecutionContext();
    const result = await tool.executor.execute(args, context);
    const endTime = Date.now();
    
    console.log(`✅ 工具执行完成 (耗时: ${endTime - startTime}ms)`);
    console.log('返回结果:', result);
    console.groupEnd();

    // 发送工具调用完成事件
    createToolCallEvent({
      toolName: toolCall.function.name,
      arguments: args,
      status: 'completed',
      result: result,
      duration: endTime - startTime
    });

    return {
      tool_call_id: toolCall.id,
      content: JSON.stringify(result)
    };
  } catch (error) {
    const errorMessage = `执行工具时发生错误：${error instanceof Error ? error.message : '未知错误'}`;
    
    console.error('❌ 工具执行失败:', error);
    console.groupEnd();

    // 发送工具调用失败事件
    createToolCallEvent({
      toolName: toolCall.function.name,
      arguments: JSON.parse(toolCall.function.arguments || '{}'),
      status: 'failed',
      error: errorMessage
    });

    return {
      tool_call_id: toolCall.id,
      content: JSON.stringify({
        success: false,
        error: errorMessage
      })
    };
  }
}

// 批量执行工具调用（兼容旧格式）
export async function executeToolCalls(toolCalls: Array<{
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}>): Promise<ToolResult[]> {
  if (toolCalls.length === 0) {
    return [];
  }

  return Promise.all(toolCalls.map(toolCall => executeTool(toolCall)));
}

// 工具系统状态检查
export function getToolSystemStatus(): {
  totalTools: number;
  availableTools: string[];
  registryStats: ReturnType<typeof globalToolRegistry.getStats>;
} {
  return {
    totalTools: globalToolRegistry.getAll().length,
    availableTools: getAvailableTools(),
    registryStats: globalToolRegistry.getStats()
  };
}
