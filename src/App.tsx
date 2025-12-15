import { Toolbar } from './components/Toolbar/Toolbar'
import { Canvas } from './components/Canvas/Canvas'

function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-gray-800 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">AI-Driven Workflow Editor</h1>
        <p className="text-sm text-gray-300 mt-1">
          自然言語で編集できるワークフロー図エディタ
        </p>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <Toolbar />
        <Canvas />
      </main>
    </div>
  )
}

export default App
