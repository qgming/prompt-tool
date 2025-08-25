import { CharacterQueryExecutor } from '../executors/CharacterQueryExecutor';
import { characterToolDefinition } from '../definitions/characterTool';
export class ToolFactory {
    static createCharacterQueryTool() {
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
}
