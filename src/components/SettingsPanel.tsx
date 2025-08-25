import { useState } from "react"
import { Settings, MessageSquare, Brain } from "lucide-react"
import { PromptSettings } from "./PromptSettings"
import { ModelSettings } from "./ModelSettings"

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<"prompt" | "model">("prompt")

  return (
    <div className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-48 md:h-auto md:min-h-0 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-600" />
          设置
        </h2>
      </div>

      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("prompt")}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
            activeTab === "prompt"
              ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50/50"
              : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          提示词
        </button>
        <button
          onClick={() => setActiveTab("model")}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
            activeTab === "model"
              ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50/50"
              : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Brain className="w-4 h-4 inline mr-2" />
          模型
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "prompt" ? <PromptSettings /> : <ModelSettings />}
      </div>
    </div>
  )
}
