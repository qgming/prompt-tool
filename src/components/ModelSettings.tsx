import { useState, useEffect } from 'react'

interface ModelSettingsData {
  apiUrl: string
  apiKey: string
  modelName: string
  topP: number
  temperature: number
}

export function ModelSettings() {
  const [settings, setSettings] = useState<ModelSettingsData>({
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    modelName: 'gpt-4',
    topP: 0.9,
    temperature: 0.7
  })

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('modelSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('加载模型设置失败:', error)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('modelSettings', JSON.stringify(settings))
    alert('模型设置已保存到本地存储')
  }

  const handleChange = (field: keyof ModelSettingsData, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          API URL
        </label>
        <input
          type="url"
          placeholder="https://api.openai.com/v1/chat/completions"
          value={settings.apiUrl}
          onChange={(e) => handleChange('apiUrl', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          API Key
        </label>
        <input
          type="password"
          placeholder="sk-..."
          value={settings.apiKey}
          onChange={(e) => handleChange('apiKey', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Model Name
        </label>
        <input
          type="text"
          placeholder="gpt-4, gpt-3.5-turbo, claude-3.5-sonnet 等"
          value={settings.modelName}
          onChange={(e) => handleChange('modelName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-4">高级设置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Top P 
              <span className="bg-cyan-500 mx-2 px-1 text-white text-xs font-medium rounded-lg">
                {settings.topP.toFixed(1)}
              </span>
            </label>
            
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.topP}
                onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              温度
               <span className="bg-cyan-500 mx-2 px-1 text-white text-xs font-medium rounded-lg">
                {settings.temperature.toFixed(1)}
              </span>
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>保守</span>
              <span>平衡</span>
              <span>创意</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-auto w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        保存到本地
      </button>
    </div>
  )
}
