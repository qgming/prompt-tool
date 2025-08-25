// 事件总线系统，用于实时状态追踪
export interface APIRequestEvent {
  type: 'api_request';
  id: string;
  timestamp: Date;
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  settings: {
    temperature: number;
    topP: number;
  };
  duration?: number;
  status: 'started' | 'completed' | 'failed';
  error?: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ToolCallEvent {
  type: 'tool_call';
  id: string;
  timestamp: Date;
  toolName: string;
  arguments: Record<string, unknown>;
  duration?: number;
  status: 'started' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
}

export interface StreamEvent {
  type: 'stream';
  id: string;
  timestamp: Date;
  content: string;
  isComplete: boolean;
}

export interface SystemEvent {
  type: 'system';
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

export type StatusEvent = APIRequestEvent | ToolCallEvent | StreamEvent | SystemEvent;

class StatusEventBus {
  private listeners: Map<string, Set<(event: StatusEvent) => void>> = new Map();
  private events: StatusEvent[] = [];
  private maxEvents = 50;

  // 添加事件监听器
  on(eventType: string, callback: (event: StatusEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  // 移除事件监听器
  off(eventType: string, callback: (event: StatusEvent) => void) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  // 触发事件
  emit(event: StatusEvent) {
    this.events.push(event);
    
    // 限制事件数量
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // 通知所有监听器
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }

    // 通知通配符监听器
    const allCallbacks = this.listeners.get('*');
    if (allCallbacks) {
      allCallbacks.forEach(callback => callback(event));
    }
  }

  // 获取最近的事件
  getRecentEvents(count = 20): StatusEvent[] {
    return this.events.slice(-count);
  }

  // 获取特定类型的事件
  getEventsByType(type: string): StatusEvent[] {
    return this.events.filter(event => event.type === type);
  }

  // 清除所有事件
  clear() {
    this.events = [];
  }

  // 获取统计信息
  getStats() {
    const apiEvents = this.getEventsByType('api_request') as APIRequestEvent[];
    const toolEvents = this.getEventsByType('tool_call') as ToolCallEvent[];
    
    return {
      totalEvents: this.events.length,
      apiRequests: apiEvents.length,
      toolCalls: toolEvents.length,
      errors: this.events.filter(e => e.type === 'system' && e.level === 'error').length,
      lastActivity: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null,
      avgResponseTime: apiEvents
        .filter(e => e.duration !== undefined)
        .reduce((sum, e) => sum + (e.duration || 0), 0) / 
        apiEvents.filter(e => e.duration !== undefined).length || 0,
    };
  }
}

// 全局事件总线实例
export const statusEventBus = new StatusEventBus();

// 便捷的事件创建函数
export const createAPIRequestEvent = (params: Omit<APIRequestEvent, 'type' | 'id' | 'timestamp'>): APIRequestEvent => {
  const event: APIRequestEvent = {
    type: 'api_request',
    id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...params
  };
  statusEventBus.emit(event);
  return event;
};

export const createToolCallEvent = (params: Omit<ToolCallEvent, 'type' | 'id' | 'timestamp'>): ToolCallEvent => {
  const event: ToolCallEvent = {
    type: 'tool_call',
    id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...params
  };
  statusEventBus.emit(event);
  return event;
};

export const createStreamEvent = (params: Omit<StreamEvent, 'type' | 'id' | 'timestamp'>): StreamEvent => {
  const event: StreamEvent = {
    type: 'stream',
    id: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...params
  };
  statusEventBus.emit(event);
  return event;
};

export const createSystemEvent = (params: Omit<SystemEvent, 'type' | 'id' | 'timestamp'>): SystemEvent => {
  const event: SystemEvent = {
    type: 'system',
    id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...params
  };
  statusEventBus.emit(event);
  return event;
};
