export class CharacterQueryExecutor {
    async execute(args, context) {
        try {
            const name = args.name;
            // 参数验证
            if (!name || typeof name !== 'string') {
                return {
                    success: false,
                    error: '人物姓名不能为空且必须是字符串'
                };
            }
            // 从上下文中获取数据
            if (!context.hasResource('charactersData')) {
                return {
                    success: false,
                    error: '人物数据资源未配置'
                };
            }
            const characters = context.getResource('charactersData');
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
        }
        catch (error) {
            return {
                success: false,
                error: `查询人物信息时发生错误：${error instanceof Error ? error.message : '未知错误'}`
            };
        }
    }
}
