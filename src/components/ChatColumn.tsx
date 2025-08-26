import { Bot, User, AlertCircle, RefreshCw } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatColumnProps {
  title: string
  messages: Message[]
  isLoading: boolean
  error: string | null
  themeColor: 'blue' | 'green'
  onClear: () => void
}

export function ChatColumn({ 
  title, 
  messages, 
  isLoading, 
  error, 
  themeColor,
  onClear
}: ChatColumnProps) {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-0">
      <div className={`p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0`}>
        <h3 className={`text-base font-semibold ${themeColor === 'blue' ? 'text-blue-600' : 'text-green-600'}`}>
          {title}
        </h3>
        <button
          onClick={onClear}
          className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
          title="清空对话"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-xs font-medium text-red-800">错误</h3>
                    <p className="text-xs text-red-700 mt-0.5">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      themeColor === 'blue' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-green-50 text-green-600'
                    }`}>
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-sm ${
                      message.role === "assistant" ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-xl shadow-sm text-sm ${
                        message.role === "assistant"
                          ? "bg-gray-50 border border-gray-200 text-gray-800"
                          : themeColor === 'blue'
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      }`}
                    >
                      <p className="leading-relaxed break-words">{message.content || (message.role === "assistant" && isLoading ? "正在思考..." : "")}</p>
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        message.role === "assistant" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
