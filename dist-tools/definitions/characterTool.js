export const characterToolDefinition = {
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
