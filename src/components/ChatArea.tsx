import { useState } from "react"
import { Send, Bot, User, AlertCircle } from "lucide-react"
import { sendChatMessage, isAPIConfigured, type ChatMessage } from "../lib/chat"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好！我是AI助手，有什么可以帮助你的吗？",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!inputValue.trim()) return

    // 检查API配置
    if (!isAPIConfigured()) {
      setError("请先配置API密钥，点击右上角设置按钮进行配置")
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      // 准备聊天消息
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // 添加用户新消息
      chatMessages.push({
        role: "user",
        content: inputValue
      })

      // 创建AI回复消息占位符
      const aiMessageId = (Date.now() + 1).toString()
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])

      // 调用真实API（使用流式响应）
      let fullResponse = ''
      await sendChatMessage(chatMessages, (chunk) => {
        fullResponse += chunk
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullResponse }
              : msg
          )
        )
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "发生未知错误"
      setError(errorMessage)
      
      // 移除失败的AI消息
      setMessages(prev => prev.filter(msg => msg.role !== "assistant" || msg.content))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">对话测试</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">错误</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div
              className={`max-w-lg ${
                message.role === "assistant" ? "order-2" : "order-1"
              }`}
            >
              <div
                className={`px-5 py-4 rounded-2xl shadow-sm ${
                  message.role === "assistant"
                    ? "bg-gray-50 border border-gray-200 text-gray-800"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 text-white"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content || (message.role === "assistant" && isLoading ? "正在思考..." : "")}</p>
              </div>
              <div
                className={`text-xs mt-2 ${
                  message.role === "assistant" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            {message.role === "user" && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
            rows={1}
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
