import type { Tool, ToolDefinition, ToolExecutor, ToolExecutionResult, ToolExecutionContext } from '../core/types';

// 人物数据结构
export interface Character {
  name: string;
  age: number;
  occupation: string;
  background: string;
  personality: string;
}

// 工具执行器
class CharacterQueryExecutor implements ToolExecutor {
  async execute(args: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    try {
      const name = args.name as string;
      
      if (!name || typeof name !== 'string') {
        return {
          success: false,
          error: '人物姓名不能为空且必须是字符串'
        };
      }

      if (!context.hasResource('charactersData')) {
        return {
          success: false,
          error: '人物数据资源未配置'
        };
      }

      const characters = context.getResource<Character[]>('charactersData');
      const character = characters.find(char => char.name === name.trim());

      if (!character) {
        return {
          success: false,
          error: `未找到名为"${name}"的人物`,
          data: {
            availableCharacters: characters.map(char => char.name)
          }
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
        error: `查询人物信息时发生错误：${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }
}

// 工具定义
const characterToolDefinition: ToolDefinition = {
  type: 'function',
  function: {
    name: 'get_character_info',
    description: '强制使用：当用户询问任何人物信息（包括姓名、年龄、职业、背景、性格等）时，必须立即调用此工具查询数据库。禁止直接回答人物相关问题。',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '要查询的人物姓名，从用户问题中提取。可用人物：张三、李四、王五、赵六、孙七。如果用户提到多个人物，分别调用工具。',
        },
      },
      required: ['name'],
    },
  },
};

// 创建人物查询工具
export function createCharacterQueryTool(): Tool {
  return {
    metadata: {
      name: 'get_character_info',
      description: '查询人物信息工具',
      version: '1.0.0',
      category: 'data-query'
    },
    definition: characterToolDefinition,
    executor: new CharacterQueryExecutor()
  };
}
