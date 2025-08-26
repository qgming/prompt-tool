import { useState } from "react"
import { sendChatMessage, isAPIConfigured, type ChatMessage } from "../lib/chat"
import { ChatColumn } from "./ChatColumn"
import { SharedInputArea } from "./SharedInputArea"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ComparisonChatArea() {
  const [messagesA, setMessagesA] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好！我是使用提示词A的AI助手，有什么可以帮助你的吗？",
      timestamp: new Date(),
    },
  ])
  
  const [messagesB, setMessagesB] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好！我是使用提示词B的AI助手，有什么可以帮助你的吗？",
      timestamp: new Date(),
    },
  ])

  const [isLoadingA, setIsLoadingA] = useState(false)
  const [isLoadingB, setIsLoadingB] = useState(false)
  const [errorA, setErrorA] = useState<string | null>(null)
  const [errorB, setErrorB] = useState<string | null>(null)
  const [sharedInput, setSharedInput] = useState("")

  const handleSendToBoth = async () => {
    if (!sharedInput.trim()) return

    // 检查API配置
    if (!isAPIConfigured()) {
      const errorMsg = "请先配置API密钥，点击右上角设置按钮进行配置"
      setErrorA(errorMsg)
      setErrorB(errorMsg)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: sharedInput,
      timestamp: new Date(),
    }

    // 添加到两个对话区域
    setMessagesA(prev => [...prev, userMessage])
    setMessagesB(prev => [...prev, userMessage])
    setSharedInput("")
    setErrorA(null)
    setErrorB(null)

    // 准备聊天消息
    const chatMessagesA: ChatMessage[] = messagesA.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    const chatMessagesB: ChatMessage[] = messagesB.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // 添加用户新消息
    chatMessagesA.push({ role: "user", content: sharedInput })
    chatMessagesB.push({ role: "user", content: sharedInput })

    // 同时发送到两个API
    setIsLoadingA(true)
    setIsLoadingB(true)

    // 发送给提示词A
    const aiMessageIdA = (Date.now() + 1).toString()
    const aiMessageA: Message = {
      id: aiMessageIdA,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }
    setMessagesA(prev => [...prev, aiMessageA])

    // 发送给提示词B
    const aiMessageIdB = (Date.now() + 2).toString()
    const aiMessageB: Message = {
      id: aiMessageIdB,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }
    setMessagesB(prev => [...prev, aiMessageB])

    try {
      // 并行调用两个API
      await Promise.all([
        sendChatMessage(chatMessagesA, (chunk) => {
          setMessagesA(prev => 
            prev.map(msg => 
              msg.id === aiMessageIdA 
                ? { ...msg, content: (msg.content || "") + chunk }
                : msg
            )
          )
        }, 'systemPromptA'),

        sendChatMessage(chatMessagesB, (chunk) => {
          setMessagesB(prev => 
            prev.map(msg => 
              msg.id === aiMessageIdB 
                ? { ...msg, content: (msg.content || "") + chunk }
                : msg
            )
          )
        }, 'systemPromptB')
      ])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "发生未知错误"
      setErrorA(errorMessage)
      setErrorB(errorMessage)
      
      // 移除失败的AI消息
      setMessagesA(prev => prev.filter(msg => !(msg.role === "assistant" && !msg.content)))
      setMessagesB(prev => prev.filter(msg => !(msg.role === "assistant" && !msg.content)))
    } finally {
      setIsLoadingA(false)
      setIsLoadingB(false)
    }
  }

  const handleClearA = () => {
    setMessagesA([
      {
        id: "1",
        role: "assistant",
        content: "你好！我是使用提示词A的AI助手，有什么可以帮助你的吗？",
        timestamp: new Date(),
      },
    ])
  }

  const handleClearB = () => {
    setMessagesB([
      {
        id: "1",
        role: "assistant",
        content: "你好！我是使用提示词B的AI助手，有什么可以帮助你的吗？",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <ChatColumn
          title="提示词A"
          messages={messagesA}
          isLoading={isLoadingA}
          error={errorA}
          themeColor="blue"
          onClear={handleClearA}
        />

        <ChatColumn
          title="提示词B"
          messages={messagesB}
          isLoading={isLoadingB}
          error={errorB}
          themeColor="green"
          onClear={handleClearB}
        />
      </div>

      <div className="flex-shrink-0 mt-auto">
        <SharedInputArea
          value={sharedInput}
          onChange={setSharedInput}
          onSend={handleSendToBoth}
          isLoading={isLoadingA || isLoadingB}
          placeholder="输入消息，将同时发送到两个对话区域进行对比..."
          hint="消息将同时发送到两个对话区域，分别使用不同的系统提示词"
        />
      </div>
    </div>
  )
}
