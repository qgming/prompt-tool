import { useState, useEffect } from "react"
import { Activity, Clock, Server, Terminal, AlertCircle } from "lucide-react"
import { statusEventBus, type StatusEvent } from "../lib/statusEvents"

interface StatusPanelProps {
  className?: string
}

export function StatusPanel({ className = "" }: StatusPanelProps) {
  const [events, setEvents] = useState<StatusEvent[]>([])
  const [stats, setStats] = useState({
    apiRequests: 0,
    toolCalls: 0,
    errors: 0,
    avgResponseTime: 0,
    model: "GPT-4",
    connected: true
  })

  // 监听事件更新
  useEffect(() => {
    const handleEvent = (event: StatusEvent) => {
      setEvents(prev => [...prev, event].slice(-10)) // 只保留最近10条
    }

    statusEventBus.on('*', handleEvent)
    setEvents(statusEventBus.getRecentEvents(10))
    
    return () => {
      statusEventBus.off('*', handleEvent)
    }
  }, [])

  // 更新统计信息
  useEffect(() => {
    const updateStats = () => {
      const newStats = statusEventBus.getStats()
      const modelSettings = localStorage.getItem('modelSettings')
      let modelName = 'GPT-4'
      
      try {
        if (modelSettings) {
          const parsed = JSON.parse(modelSettings)
          modelName = parsed.modelName || 'GPT-4'
        }
      } catch (e) {
        console.error('解析模型设置失败:', e)
      }
      
      setStats({
        apiRequests: newStats.apiRequests,
        toolCalls: newStats.toolCalls,
        errors: newStats.errors,
        avgResponseTime: Math.round(newStats.avgResponseTime),
        model: modelName,
        connected: true
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getEventStatus = (event: StatusEvent) => {
    if (event.type === 'api_request' || event.type === 'tool_call') {
      return event.status
    }
    return event.type === 'system' ? event.level : 'info'
  }

  const getStatusColor = (event: StatusEvent) => {
    const status = getEventStatus(event)
    
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      case 'started': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getEventIcon = (event: StatusEvent) => {
    switch (event.type) {
      case 'api_request': return <Server className="w-4 h-4" />
      case 'tool_call': return <Terminal className="w-4 h-4" />
      case 'system': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className={`w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-auto ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          状态监控
        </h2>
      </div>

      {/* 统计概览 */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">API请求</span>
              <Server className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold text-gray-800 mt-1">{stats.apiRequests}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">工具调用</span>
              <Terminal className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold text-gray-800 mt-1">{stats.toolCalls}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">错误</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-lg font-semibold text-gray-800 mt-1">{stats.errors}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">平均响应</span>
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold text-gray-800 mt-1">
              {formatDuration(stats.avgResponseTime)}
            </div>
          </div>
        </div>
      </div>

      {/* 最近事件 */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">最近事件</h3>
        {events.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">暂无事件</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className={`p-3 rounded-lg border ${getStatusColor(event)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event)}
                    <span className="text-sm font-medium">
                      {event.type === 'api_request' && 'API请求'}
                      {event.type === 'tool_call' && '工具调用'}
                      {event.type === 'system' && '系统事件'}
                      {event.type === 'stream' && '流式响应'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
                
                {event.type === 'api_request' && (
                  <>
                    <div className="text-xs text-gray-600 mt-1 ml-6">
                      模型: {event.model}
                    </div>
                    {event.status === 'failed' && event.error && (
                      <div className="text-xs text-red-600 mt-1 ml-6">
                        错误: {event.error}
                      </div>
                    )}
                  </>
                )}
                
                {event.type === 'tool_call' && (
                  <>
                    <div className="text-xs text-gray-600 mt-1 ml-6">
                      工具: {event.toolName}
                    </div>
                    {event.arguments && Object.keys(event.arguments).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 ml-6">
                        参数: {JSON.stringify(event.arguments).substring(0, 50)}...
                      </div>
                    )}
                    {event.status === 'failed' && event.error && (
                      <div className="text-xs text-red-600 mt-1 ml-6">
                        错误: {event.error}
                      </div>
                    )}
                  </>
                )}
                
                {(event.type === 'api_request' || event.type === 'tool_call') && event.duration && (
                  <div className="text-xs text-gray-600 ml-6">
                    耗时: {formatDuration(event.duration)}
                  </div>
                )}
                
                {event.type === 'system' && (
                  <div className="text-xs text-gray-600 mt-1 ml-6">
                    {event.message}
                  </div>
                )}
                
                {event.type === 'stream' && (
                  <div className="text-xs text-gray-600 mt-1 ml-6">
                    {event.content.substring(0, 50)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
