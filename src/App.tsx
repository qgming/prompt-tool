import { SettingsPanel } from "./components/SettingsPanel"
import { ComparisonChatArea } from "./components/ComparisonChatArea"
import { StatusPanel } from "./components/StatusPanel"

function App() {
  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 p-4 gap-4 overflow-hidden">
      <div className="flex-1 flex gap-4 min-h-0">
        <SettingsPanel />
        <div className="flex-1 min-h-0">
          <ComparisonChatArea />
        </div>
        <StatusPanel />
      </div>
    </div>
  )
}

export default App
