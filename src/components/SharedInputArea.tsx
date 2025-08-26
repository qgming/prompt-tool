import { Send, CornerDownLeft } from "lucide-react"
import { useState } from "react"

interface SharedInputAreaProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isLoading: boolean
  placeholder?: string
  hint?: string
}

export function SharedInputArea({ 
  value, 
  onChange, 
  onSend, 
  isLoading,
  placeholder = "输入消息...",
  hint = "消息将同时发送到两个对话区域"
}: SharedInputAreaProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault()
      onSend()
    }
  }

  return (
      <div className="pt-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="relative">
            <div className={`relative flex gap-2 transition-all duration-200 ${
              isFocused ? "transform scale-[1.01]" : ""
            }`}>
              <div className="flex-1 relative">
                <textarea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm resize-none 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                    transition-all duration-200 bg-gray-50 hover:bg-gray-100"
                  rows={1}
                  style={{ 
                    minHeight: "44px", 
                    maxHeight: "100px"
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <span className="text-xs text-gray-400 hidden sm:block">
                    Shift+Enter 换行
                  </span>
                </div>
              </div>
              <button
                onClick={onSend}
                disabled={!value.trim() || isLoading}
                className="px-3 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white 
                  rounded-lg hover:from-primary-700 hover:to-primary-800 
                  disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed 
                  transition-all duration-200 active:scale-95
                  flex items-center justify-center min-w-[44px] h-[44px]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {hint && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {hint}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <CornerDownLeft className="w-3 h-3" />
                  <span>Enter 发送</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
