import { SettingsPanel } from "./components/SettingsPanel"
import { ChatArea } from "./components/ChatArea"
import { StatusPanel } from "./components/StatusPanel"
import { registerBuiltInTools } from "./tools/impl"

// 注册所有内置工具
registerBuiltInTools()

function App() {
  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 p-4 gap-4">
      <div className="flex-1 flex gap-4 min-h-0">
        <SettingsPanel />
        <ChatArea />
        <StatusPanel />
      </div>
    </div>
  )
}

export default App
