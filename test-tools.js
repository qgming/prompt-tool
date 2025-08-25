// 简单的工具测试脚本
import { getToolDefinitions, executeTool } from './src/lib/tools.js';

async function testTools() {
  console.log('=== 测试工具系统 ===');
  
  // 测试获取工具定义
  const tools = getToolDefinitions();
  console.log('可用工具:', tools.map(t => t.function.name));
  
  // 测试人物查询工具
  const testToolCall = {
    id: 'test-123',
    type: 'function',
    function: {
      name: 'get_character_info',
      arguments: JSON.stringify({ name: '张三' })
    }
