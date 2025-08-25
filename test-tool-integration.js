// 测试工具集成
import { registerBuiltInTools } from './src/tools/impl/index.js'
import { executeTool } from './src/lib/tools.js'

// 注册工具
registerBuiltInTools()

// 测试工具调用
async function testToolIntegration() {
  console.log('🧪 开始测试工具集成...')
  
  try {
    const toolCall = {
      id: 'test_123',
      type: 'function',
      function: {
        name: 'get_character_info',
        arguments: JSON.stringify({ name: '张三' })
      }
    }

    console.log('📞 调用工具:', toolCall)
    const result = await executeTool(toolCall)
    console.log('✅ 工具返回结果:', result)
    
    const parsed = JSON.parse(result.content)
    if (parsed.success) {
      console.log('🎉 工具调用成功:', parsed.data.description)
