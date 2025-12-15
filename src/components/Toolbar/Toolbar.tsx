import { useCanvasStore, getCanvasElement } from '@/store/canvasStore'
import { useToolStore } from '@/store/toolStore'
import { NodeType } from '@/types/nodes'
import { exportToJSON, exportToPNG, exportToSVG, importFromJSON } from '@/utils/exportImport'
import { useRef } from 'react'

export const Toolbar = () => {
  const { selectedTool, setSelectedTool } = useToolStore()
  const canvasStore = useCanvasStore()
  const { addNode, undo, redo, nodes, connections, zoom, setZoom, resetView, loadWorkflow } = canvasStore
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddNode = (type: NodeType) => {
    const newNode = {
      id: crypto.randomUUID(),
      type,
      x: 400 + Math.random() * 100,
      y: 300 + Math.random() * 100,
      width: type === 'process' ? 120 : 100,
      height: type === 'process' ? 60 : 100,
      label:
        type === 'process'
          ? 'プロセス'
          : type === 'decision'
          ? '判断'
          : type === 'start'
          ? '開始'
          : '終了',
    }
    addNode(newNode)
  }

  const handleExportJSON = () => {
    exportToJSON(nodes, connections, `workflow-${Date.now()}.json`)
  }

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await importFromJSON(file)

      if (confirm(`${data.nodes.length}個のノードと${data.connections.length}個の接続をインポートします。現在のワークフローは上書きされます。よろしいですか？`)) {
        loadWorkflow(data.nodes, data.connections)
      }
    } catch (error) {
      alert(`インポートに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleExportPNG = () => {
    const canvasElement = getCanvasElement()
    if (!canvasElement) {
      alert('Canvas is not available')
      return
    }
    exportToPNG(canvasElement, `workflow-${Date.now()}.png`)
  }

  const handleExportSVG = () => {
    exportToSVG(nodes, connections, `workflow-${Date.now()}.svg`)
  }

  return (
    <aside className="w-64 bg-gray-100 p-4 flex flex-col gap-6 overflow-y-auto">
      {/* ヘッダー */}
      <div>
        <h2 className="text-lg font-bold text-gray-800">ツールバー</h2>
        <p className="text-xs text-gray-600 mt-1">
          ノード: {nodes.length} / 接続: {connections.length}
        </p>
      </div>

      {/* ノード追加セクション */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">
          ノード追加
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAddNode('process')}
            className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group"
            title="プロセスノードを追加"
          >
            <div className="w-12 h-8 border-2 border-blue-500 rounded bg-blue-100 group-hover:bg-blue-200"></div>
            <span className="text-xs font-medium">プロセス</span>
          </button>

          <button
            onClick={() => handleAddNode('decision')}
            className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all flex flex-col items-center gap-2 group"
            title="判断ノードを追加"
          >
            <div className="w-8 h-8 border-2 border-yellow-500 transform rotate-45 bg-yellow-100 group-hover:bg-yellow-200"></div>
            <span className="text-xs font-medium">判断</span>
          </button>

          <button
            onClick={() => handleAddNode('start')}
            className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all flex flex-col items-center gap-2 group"
            title="開始ノードを追加"
          >
            <div className="w-10 h-6 border-2 border-green-500 rounded-full bg-green-100 group-hover:bg-green-200"></div>
            <span className="text-xs font-medium">開始</span>
          </button>

          <button
            onClick={() => handleAddNode('end')}
            className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all flex flex-col items-center gap-2 group"
            title="終了ノードを追加"
          >
            <div className="relative w-10 h-6">
              <div className="absolute inset-0 border-2 border-red-500 rounded-full bg-red-100 group-hover:bg-red-200"></div>
              <div className="absolute inset-1 border-2 border-red-500 rounded-full"></div>
            </div>
            <span className="text-xs font-medium">終了</span>
          </button>
        </div>
      </section>

      {/* ツールセクション */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">ツール</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedTool('select')}
            className={`p-3 rounded-lg text-left transition-all ${
              selectedTool === 'select'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="font-medium">↖ 選択</span>
          </button>

          <button
            onClick={() => setSelectedTool('pan')}
            className={`p-3 rounded-lg text-left transition-all ${
              selectedTool === 'pan'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="font-medium">✋ パン</span>
          </button>

          <button
            onClick={() => setSelectedTool('connect')}
            className={`p-3 rounded-lg text-left transition-all ${
              selectedTool === 'connect'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="font-medium">→ コネクタ</span>
          </button>

          <button
            onClick={() => setSelectedTool('delete')}
            className={`p-3 rounded-lg text-left transition-all ${
              selectedTool === 'delete'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="font-medium">🗑 削除</span>
          </button>
        </div>
      </section>

      {/* ビュー制御 */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">
          ビュー制御
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setZoom(zoom * 1.2)}
              className="flex-1 p-2 bg-white rounded-lg border hover:bg-gray-50 transition-all text-sm font-medium"
              title="ズームイン (Ctrl++)"
            >
              + ズームイン
            </button>
            <button
              onClick={() => setZoom(zoom * 0.8)}
              className="flex-1 p-2 bg-white rounded-lg border hover:bg-gray-50 transition-all text-sm font-medium"
              title="ズームアウト (Ctrl+-)"
            >
              - ズームアウト
            </button>
          </div>
          <button
            onClick={resetView}
            className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-all text-sm font-medium"
            title="表示をリセット"
          >
            ⊡ 全体表示
          </button>
          <div className="text-center p-2 bg-gray-200 rounded-lg text-sm font-medium">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </section>

      {/* エクスポート・インポート */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">
          ファイル操作
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleExportJSON}
            className="p-2 bg-white rounded-lg border hover:bg-blue-50 hover:border-blue-400 transition-all text-sm font-medium"
            title="JSONとしてエクスポート"
          >
            💾 JSONエクスポート
          </button>
          <button
            onClick={handleImportClick}
            className="p-2 bg-white rounded-lg border hover:bg-green-50 hover:border-green-400 transition-all text-sm font-medium"
            title="JSONからインポート"
          >
            📂 JSONインポート
          </button>
          <div className="h-px bg-gray-300 my-1"></div>
          <button
            onClick={handleExportPNG}
            className="p-2 bg-white rounded-lg border hover:bg-purple-50 hover:border-purple-400 transition-all text-sm font-medium"
            title="PNG画像としてエクスポート"
          >
            🖼️ PNGエクスポート
          </button>
          <button
            onClick={handleExportSVG}
            className="p-2 bg-white rounded-lg border hover:bg-orange-50 hover:border-orange-400 transition-all text-sm font-medium"
            title="SVG画像としてエクスポート"
          >
            🎨 SVGエクスポート
          </button>
        </div>
      </section>

      {/* 履歴操作 */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">履歴</h3>
        <div className="flex gap-2">
          <button
            onClick={undo}
            className="flex-1 p-3 bg-white rounded-lg border hover:bg-gray-50 transition-all font-medium"
            title="取り消し (Ctrl+Z)"
          >
            ↶ 取り消し
          </button>
          <button
            onClick={redo}
            className="flex-1 p-3 bg-white rounded-lg border hover:bg-gray-50 transition-all font-medium"
            title="やり直し (Ctrl+Y)"
          >
            ↷ やり直し
          </button>
        </div>
      </section>

      {/* ヘルプ */}
      <section className="mt-auto pt-4 border-t border-gray-300">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">
          ショートカット
        </h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Delete/Backspace: 削除</p>
          <p>• Ctrl+C: コピー</p>
          <p>• Ctrl+V: ペースト</p>
          <p>• Ctrl+Z: 取り消し</p>
          <p>• Ctrl+Y: やり直し</p>
          <p>• Ctrl++: ズームイン</p>
          <p>• Ctrl+-: ズームアウト</p>
          <p>• Ctrl+0: 表示リセット</p>
          <p>• マウスホイール: ズーム</p>
        </div>
      </section>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportJSON}
        className="hidden"
      />
    </aside>
  )
}
