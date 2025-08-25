import OpenAI from 'openai';
import { getToolDefinitions, executeTool } from './tools';
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

// 获取系统提示词
function getSystemPrompt(): string {
  try {
    const savedPrompt = localStorage.getItem('systemPrompt');
    return savedPrompt || `你是一个AI助手，专门使用工具来回答用户问题。当用户询问任何人物信息时，必须使用工具查询。

## 可用工具
- get_character_info: 查询人物信息数据库
  - 参数: name (string) - 人物姓名
  - 可用人物: 张三、李四、王五、赵六、孙七

## 规则
1. 当用户提到具体人物姓名时，必须调用get_character_info工具
2. 基于工具返回的信息回答用户
3. 如果人物不存在，告知用户可用的人物列表

记住：任何涉及人物信息的问题都必须通过工具查询，禁止直接回答。`;
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

// 正则表达式匹配工具调用
function parseToolCallsFromMessage(message: string): Array<{
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}> | null {
  try {
    // 匹配完整的工具调用JSON格式
    const toolCallRegex = /"finish_reason"\s*:\s*"tool_calls".*"tool_calls"\s*:\s*\[([\s\S]*?)\]/;
    const match = message.match(toolCallRegex);
    
    if (match) {
      // 提取工具调用数组
      const toolCallsMatch = message.match(/"tool_calls"\s*:\s*\[([\s\S]*?)\]/);
      if (toolCallsMatch) {
        const toolCallsStr = `[${toolCallsMatch[1]}]`;
        const toolCalls = JSON.parse(toolCallsStr);
        
        console.log('🔍 正则匹配到工具调用:', toolCalls);
        return toolCalls;
      }
    }
    
    // 备用匹配：直接匹配工具调用对象
    const simpleToolCallRegex = /\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"type"\s*:\s*"function"\s*,\s*"function"\s*:\s*\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"arguments"\s*:\s*({[^}]+})\s*\}\s*\}/g;
    let match2;
    const toolCalls: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }> = [];
    
    while ((match2 = simpleToolCallRegex.exec(message)) !== null) {
      toolCalls.push({
        id: match2[1],
        type: 'function' as const,
        function: {
          name: match2[2],
          arguments: match2[3]
        }
      });
    }
    
    if (toolCalls.length > 0) {
      console.log('🔍 正则匹配到简化工具调用:', toolCalls);
      return toolCalls;
    }
    
    return null;
  } catch (error) {
    console.error('❌ 解析工具调用失败:', error);
    return null;
  }
}

// 发送聊天消息（基于正则表达式的工具调用检测）
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

  let currentMessages: ChatMessage[] = [
    { role: 'system' as const, content: systemPrompt },
    ...messages
  ];

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
    const maxIterations = 5; // 防止无限循环
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      
      console.log(`🔄 开始第 ${iteration} 轮对话处理`);
      
      // 获取AI回复
      const response = await client.chat.completions.create({
        model: settings.modelName,
        messages: currentMessages,
        temperature: settings.temperature,
        top_p: settings.topP,
        tools: tools
      });

      const choice = response.choices[0];
      const aiMessage = choice.message;
      
      console.log('📨 AI回复:', {
        content: aiMessage.content,
        finish_reason: choice.finish_reason,
        tool_calls: aiMessage.tool_calls
      });

      // 检查是否有工具调用
      let toolCalls: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }> | null = null;
      
      if (choice.finish_reason === 'tool_calls' && aiMessage.tool_calls) {
        // 直接解析工具调用
        toolCalls = aiMessage.tool_calls.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: {
            name: 'function' in tc ? tc.function.name : '',
            arguments: 'function' in tc ? tc.function.arguments : '{}'
          }
        }));
      } else if (aiMessage.content) {
        // 使用正则表达式解析内容中的工具调用
        toolCalls = parseToolCallsFromMessage(JSON.stringify({
          finish_reason: choice.finish_reason,
          message: aiMessage
        }));
      }

      if (toolCalls && toolCalls.length > 0) {
        console.log('🔧 检测到工具调用请求:', toolCalls);
        
        // 详细打印工具调用指令
        toolCalls.forEach((toolCall, index) => {
          const functionName = toolCall.function.name;
          let functionArgs: Record<string, unknown> = {};
          try {
            functionArgs = JSON.parse(toolCall.function.arguments);
          } catch {
            functionArgs = {};
          }
          
          console.log(`📋 工具调用指令 #${index + 1}:`);
          console.log(`   工具ID: ${toolCall.id}`);
          console.log(`   工具名称: ${functionName}`);
          console.log(`   工具参数:`, functionArgs);
          console.log(`   原始参数字符串: ${toolCall.function.arguments}`);
          
          createToolCallEvent({
            toolName: functionName,
            arguments: functionArgs,
            status: 'started'
          });
        });

        // 执行工具调用
        const toolResults = await Promise.all(
          toolCalls.map(async (toolCall) => {
            const functionName = toolCall.function.name;
            let functionArgs: Record<string, unknown> = {};
            try {
              functionArgs = JSON.parse(toolCall.function.arguments);
            } catch {
              functionArgs = {};
            }
            
            console.log(`⚙️ 执行工具: ${functionName}`);
            console.log(`   参数:`, functionArgs);
            const startTime = Date.now();
            
            try {
              const result = await executeTool(toolCall);
              const duration = Date.now() - startTime;
              console.log(`✅ 工具执行完成: ${functionName} (${duration}ms)`);
              console.log(`   返回结果:`, JSON.parse(result.content));
              
              return result;
            } catch (error) {
              console.error(`❌ 工具执行失败: ${functionName}`, error);
              throw error;
            }
          })
        );

        // 更新工具调用完成事件
        toolResults.forEach((result, index) => {
          const toolCall = toolCalls[index];
          const functionName = toolCall.function.name;
          let functionArgs: Record<string, unknown> = {};
          try {
            functionArgs = JSON.parse(toolCall.function.arguments);
          } catch {
            functionArgs = {};
          }
          const parsedResult = JSON.parse(result.content);
          
          createToolCallEvent({
            toolName: functionName,
            arguments: functionArgs,
            status: parsedResult.success ? 'completed' : 'failed',
            result: parsedResult,
            error: parsedResult.error
          });
        });

        // 将工具结果添加到消息历史中
        currentMessages = [
          ...currentMessages,
          {
            role: 'assistant' as const,
            content: aiMessage.content || '',
            tool_calls: toolCalls
          },
          ...toolResults.map(result => ({
            role: 'tool' as const,
            content: result.content,
            tool_call_id: result.tool_call_id
          }))
        ];

        console.log('🔄 工具结果已添加到上下文，准备下一轮对话');
        
        // 继续下一轮对话，将工具结果作为上下文
        continue;
      } else {
        // 没有工具调用，直接返回内容
        console.log('💬 没有工具调用，直接返回AI回复');
        
        if (aiMessage.content) {
          console.log('📤 开始发送AI回复内容');
          console.log('✅ AI回复发送完成');
          
          // 模拟流式响应
          const content = aiMessage.content;
          const chunkSize = Math.max(1, Math.ceil(content.length / 15));
          
          for (let i = 0; i < content.length; i += chunkSize) {
            await new Promise(resolve => setTimeout(resolve, 30));
            onStream(content.slice(i, i + chunkSize));
          }
        }
        break;
      }
    }

    if (iteration >= maxIterations) {
      console.warn('⚠️ 达到最大迭代次数，停止工具调用循环');
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

    console.log('🎉 对话处理完成');

  } catch (error: unknown) {
    const apiError = error as { status?: number; message?: string };
    const errorMessage = apiError.status === 401 
      ? 'API密钥无效，请检查您的API密钥设置'
      : apiError.status === 429 
      ? '请求过于频繁，请稍后再试'
      : apiError.status === 500 
      ? '服务器内部错误，请稍后再试'
      : `API调用失败: ${apiError.message || '未知错误'}`;
    
    console.error('❌ API调用失败:', errorMessage);
    
    // 发送API请求失败事件
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
