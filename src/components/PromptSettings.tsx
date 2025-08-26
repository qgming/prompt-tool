import { useState, useEffect } from 'react'

export function PromptSettings() {
  const [promptA, setPromptA] = useState(`你是一个AI助手，仅通过工具调用响应用户查询。

## 工具调用规则
- 检测到人物名称时，立即调用get_character_info工具
- 禁止前置语义化回复
- 直接返回工具查询结果

## 可用工具
get_character_info: 查询人物信息
参数: name (人物姓名)
可用人物: 张三、李四、王五、赵六、孙七

## 响应格式
仅返回工具查询结果，不添加解释性文字。

## 示例调用
用户："张三"
AI：{"name":"get_character_info","arguments":{"name":"张三"}}`)

  const [promptB, setPromptB] = useState(`你是一个AI助手，仅通过工具调用响应用户查询。

## 工具调用规则
- 检测到人物名称时，立即调用get_character_info工具
- 禁止前置语义化回复
- 直接返回工具查询结果

## 可用工具
get_character_info: 查询人物信息
参数: name (人物姓名)
可用人物: 张三、李四、王五、赵六、孙七

## 响应格式
仅返回工具查询结果，不添加解释性文字。

## 示例调用
用户："张三"
AI：{"name":"get_character_info","arguments":{"name":"张三"}}`)

  // 从localStorage加载保存的提示词
  useEffect(() => {
    const savedPromptA = localStorage.getItem('systemPromptA')
    const savedPromptB = localStorage.getItem('systemPromptB')
    
    if (savedPromptA) {
      setPromptA(savedPromptA)
    }
    if (savedPromptB) {
      setPromptB(savedPromptB)
    }
  }, [])

  const handleSavePromptA = () => {
    localStorage.setItem('systemPromptA', promptA)
    alert('系统提示词A已保存到本地存储')
  }

  const handleSavePromptB = () => {
    localStorage.setItem('systemPromptB', promptB)
    alert('系统提示词B已保存到本地存储')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          系统提示词 A
        </label>
        <div className="flex-1 flex flex-col">
          <textarea
            className="flex-1 w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="输入系统提示词A..."
            value={promptA}
            onChange={(e) => setPromptA(e.target.value)}
          />
          <button
            onClick={handleSavePromptA}
            className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            保存提示词A
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          系统提示词 B
        </label>
        <div className="flex-1 flex flex-col">
          <textarea
            className="flex-1 w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="输入系统提示词B..."
            value={promptB}
            onChange={(e) => setPromptB(e.target.value)}
          />
          <button
            onClick={handleSavePromptB}
            className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            保存提示词B
          </button>
        </div>
      </div>
    </div>
  )
}
