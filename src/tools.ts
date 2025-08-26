import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import charactersData from './data/characters.json';

// 工具定义 - 遵循OpenAI标准格式
export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_character_info',
      description: '查询人物信息。当用户询问任何人物相关问题时必须调用此工具。',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '要查询的人物姓名。可用人物：张三、李四、王五、赵六、孙七',
          },
        },
        required: ['name'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];

// 工具执行函数
export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  switch (name) {
    case 'get_character_info':
      return executeGetCharacterInfo(args);
    default:
      return { success: false, error: `未知工具: ${name}` };
  }
}

// 人物信息数据结构
interface Character {
  name: string;
  age: number;
  occupation: string;
  background: string;
  personality: string;
}

// 人物信息查询工具实现
async function executeGetCharacterInfo(args: Record<string, unknown>) {
  try {
    const name = args.name as string;
    
    if (!name || typeof name !== 'string') {
      return { success: false, error: '人物姓名不能为空' };
    }

    const character = (charactersData as Character[]).find((char) => char.name === name.trim());
    
    if (!character) {
      const availableNames = (charactersData as Character[]).map((char) => char.name);
      return { 
        success: false, 
        error: `未找到人物"${name}"`,
        data: { availableCharacters: availableNames }
      };
    }

    return {
      success: true,
      data: {
        name: character.name,
        age: character.age,
        occupation: character.occupation,
        background: character.background,
        personality: character.personality
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `查询失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

// 获取工具定义
export function getToolDefinitions() {
  return tools;
}
