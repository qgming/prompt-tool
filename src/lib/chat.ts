import OpenAI from 'openai';
import { getToolDefinitions, executeTool } from '../tools';
import { createAPIRequestEvent, createToolCallEvent } from './statusEvents';

// 类型定义
export type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam;

interface ModelSettings {
  apiUrl: string;
  apiKey: string;
  modelName: string;
  topP: number;
  temperature: number;
}

// 获取模型设置
function getModelSettings(): ModelSettings {
  const defaultSettings: ModelSettings = {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    modelName: 'gpt-4',
    topP: 0.9,
    temperature: 0.7
  };

  try {
    const savedSettings = localStorage.getItem('modelSettings');
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  } catch (error) {
    console.error('读取模型设置失败:', error);
    return defaultSettings;
  }
}

// 获取系统提示词 - 基于OpenAI最佳实践
function getSystemPrompt(): string {
  try {
    const savedPrompt = localStorage.getItem('systemPrompt');
    return savedPrompt || `你是一个AI助手，专门使用工具来回答用户问题。

## 可用工具
- get_character_info: 查询人物信息数据库
  - 参数: name (string) - 人物姓名
  - 可用人物: 张三、李四、王五、赵六、孙七

## 使用规则
1. 当用户询问任何人物信息时，必须调用get_character_info工具
2. 基于工具返回的准确信息回答用户
3. 如果人物不存在，提供可用人物列表
4. 禁止直接回答人物相关问题，必须通过工具查询

## 响应格式
- 使用工具返回的准确信息
- 保持回答简洁明了
- 如有错误，提供有用的建议`;
  } catch (error) {
    console.error('读取系统提示词失败:', error);
    return '你是一个有用的AI助手。';
  }
}

// 创建OpenAI客户端
function createOpenAIClient(): OpenAI | null {
  const settings = getModelSettings();
  if (!settings.apiKey) {
    throw new Error('API密钥未配置，请在模型设置中配置API密钥');
  }

  return new OpenAI({
    apiKey: settings.apiKey,
    baseURL: settings.apiUrl === 'https://api.openai.com/v1/chat/completions' 
      ? undefined 
      : settings.apiUrl.replace('/chat/completions', ''),
    dangerouslyAllowBrowser: true
  });
}

// 发送聊天消息 - 增强版，包含详细日志
export async function sendChatMessage(
  messages: ChatMessage[],
  onStream: (chunk: string) => void
): Promise<void> {
  const settings = getModelSettings();
  const systemPrompt = getSystemPrompt();
  const client = createOpenAIClient();
  const requestStartTime = Date.now();

  if (!client) {
    throw new Error('无法创建OpenAI客户端');
  }

  const currentMessages: ChatMessage[] = [
    { role: 'system' as const, content: systemPrompt },
    ...messages
  ];

  // 详细日志：API请求开始
  console.group('🚀 API调用开始');
  console.log('📋 请求配置:', {
    model: settings.modelName,
    temperature: settings.temperature,
    topP: settings.topP,
    apiUrl: settings.apiUrl
  });
  console.log('💬 消息内容:', JSON.stringify(currentMessages, null, 2));
  console.groupEnd();

  // 发送API请求开始事件
  createAPIRequestEvent({
    model: settings.modelName,
    messages: currentMessages.map(msg => ({ role: msg.role, content: String(msg.content) })),
    settings: {
      temperature: settings.temperature,
      topP: settings.topP
    },
    status: 'started'
  });

  try {
    const tools = getToolDefinitions();
    const maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      
      console.group(`🔄 第 ${iteration} 轮对话`);
      console.log('📤 发送消息:', JSON.stringify(currentMessages, null, 2));
      
      // 获取AI回复
      const response = await client.chat.completions.create({
        model: settings.modelName,
        messages: currentMessages,
        temperature: settings.temperature,
        top_p: settings.topP,
        tools: tools
      });

      console.log('📥 收到响应:', JSON.stringify(response, null, 2));
      console.groupEnd();

      const aiMessage = response.choices[0].message;
      
      // 处理工具调用
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        console.group('🔧 工具调用处理');
        console.log(`发现 ${aiMessage.tool_calls.length} 个工具调用`);
        
        // 添加AI消息到历史
        currentMessages.push({
          role: 'assistant',
          content: aiMessage.content || '',
          tool_calls: aiMessage.tool_calls
        });

        // 执行所有工具调用
        const toolResults = [];
        for (const toolCall of aiMessage.tool_calls) {
          if ('function' in toolCall) {
            const toolStartTime = Date.now();
            const args = JSON.parse(toolCall.function.arguments);
            
            console.group(`🛠️ 执行工具: ${toolCall.function.name}`);
            console.log('参数:', JSON.stringify(args, null, 2));
            
            // 发送工具调用开始事件
            createToolCallEvent({
              toolName: toolCall.function.name,
              arguments: args,
              status: 'started'
            });

            const result = await executeTool(toolCall.function.name, args);
            
            console.log('结果:', JSON.stringify(result, null, 2));
            console.groupEnd();
            
            // 发送工具调用完成事件
            createToolCallEvent({
              toolName: toolCall.function.name,
              arguments: args,
              status: 'completed',
              result,
              duration: Date.now() - toolStartTime
            });

            toolResults.push({
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            });
          }
        }

        // 添加工具结果到历史
        toolResults.forEach(result => {
          currentMessages.push({
            role: 'tool',
            content: result.content,
            tool_call_id: result.tool_call_id
          });
        });

        console.groupEnd();
        continue;
      }

      // 没有工具调用，直接回复
      if (aiMessage.content) {
        console.log('💬 AI回复内容:', aiMessage.content);
        const content = aiMessage.content;
        const chunkSize = Math.max(1, Math.ceil(content.length / 15));
        
        for (let i = 0; i < content.length; i += chunkSize) {
          await new Promise(resolve => setTimeout(resolve, 30));
          onStream(content.slice(i, i + chunkSize));
        }
      }
      
      break;
    }

    if (iteration >= maxIterations) {
      console.warn('⚠️ 达到最大迭代次数');
    }

    // 发送API请求完成事件
    createAPIRequestEvent({
      model: settings.modelName,
      messages: currentMessages.map(msg => ({ role: msg.role, content: String(msg.content) })),
      settings: {
        temperature: settings.temperature,
        topP: settings.topP
      },
      status: 'completed',
      duration: Date.now() - requestStartTime
    });

  } catch (error: unknown) {
    const apiError = error as { status?: number; message?: string };
    const errorMessage = apiError.status === 401 
      ? 'API密钥无效，请检查您的API密钥设置'
      : apiError.status === 429 
      ? '请求过于频繁，请稍后再试'
      : apiError.status === 500 
      ? '服务器内部错误，请稍后再试'
      : `API调用失败: ${apiError.message || '未知错误'}`;
    
    console.error('❌ API调用失败:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : '无堆栈信息',
      timestamp: new Date().toISOString()
    });
    
    createAPIRequestEvent({
      model: settings.modelName,
      messages: currentMessages.map(msg => ({ role: msg.role, content: String(msg.content) })),
      settings: {
        temperature: settings.temperature,
        topP: settings.topP
      },
      status: 'failed',
      error: errorMessage,
      duration: Date.now() - requestStartTime
    });

    throw new Error(errorMessage);
  }
}

// 检查API配置是否有效
export function isAPIConfigured(): boolean {
  const settings = getModelSettings();
  return !!(settings.apiKey && settings.apiKey.trim());
}
