import { useEffect, useRef, useState } from 'react'
import { Canvas as FabricCanvas, Rect, Polygon, Ellipse, Group, Line, Triangle, Text, Object as FabricObject } from 'fabric'
import { useCanvasStore, setCanvasElement } from '@/store/canvasStore'
import { useToolStore } from '@/store/toolStore'
import { Node, NodeType, Connection } from '@/types/nodes'
import { importFromJSON, saveToLocalStorage, loadFromLocalStorage } from '@/utils/exportImport'

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<FabricCanvas | null>(null)
  const { nodes, connections, selectedNodeIds, updateNode, selectNode, removeNode, addConnection, addNode, zoom, panX, panY, setZoom, setPan, resetView, loadWorkflow } = useCanvasStore()
  const { selectedTool, connectingFrom, setConnectingFrom } = useToolStore()
  const [previewLine, setPreviewLine] = useState<Line | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 })
  const [isDragOver, setIsDragOver] = useState(false)
  const [clipboard, setClipboard] = useState<{ nodes: Node[]; connections: Connection[] } | null>(null)

  // Fabric.jsの初期化
  useEffect(() => {
    if (!canvasRef.current) return

    fabricCanvasRef.current = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 256 - 384, // Toolbar (256px) + ChatPanel (384px)
      height: window.innerHeight - 64, // Header (64px)
      backgroundColor: '#ffffff',
      selection: true,
    })

    // Canvas要素への参照をグローバルに保存
    setCanvasElement(canvasRef.current)

    // キーボードイベント
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = fabricCanvasRef.current?.getActiveObject()
        if (activeObject && (activeObject as any).nodeId) {
          removeNode((activeObject as any).nodeId)
        }
      }

      // コピー (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedNodeIds.length > 0) {
          const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id))
          const selectedConnections = connections.filter(
            c => selectedNodeIds.includes(c.fromNodeId) && selectedNodeIds.includes(c.toNodeId)
          )
          setClipboard({ nodes: selectedNodes, connections: selectedConnections })
        }
      }

      // ペースト (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        if (clipboard && clipboard.nodes.length > 0) {
          const idMap = new Map<string, string>()

          // 新しいIDでノードを複製（位置を少しずらす）
          clipboard.nodes.forEach(node => {
            const newId = crypto.randomUUID()
            idMap.set(node.id, newId)

            const newNode: Node = {
              ...node,
              id: newId,
              x: node.x + 50,
              y: node.y + 50,
            }
            addNode(newNode)
          })

          // 接続も複製（新しいIDでマッピング）
          clipboard.connections.forEach(conn => {
            const newFromId = idMap.get(conn.fromNodeId)
            const newToId = idMap.get(conn.toNodeId)

            if (newFromId && newToId) {
              addConnection({
                id: crypto.randomUUID(),
                fromNodeId: newFromId,
                toNodeId: newToId,
                label: conn.label,
                color: conn.color,
              })
            }
          })
        }
      }

      // ズームショートカット
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        setZoom(zoom * 1.2)
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault()
        setZoom(zoom * 0.8)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        resetView()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // リサイズ対応
    const handleResize = () => {
      fabricCanvasRef.current?.setDimensions({
        width: window.innerWidth - 256 - 384, // Toolbar + ChatPanel
        height: window.innerHeight - 64, // Header
      })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
      fabricCanvasRef.current?.dispose()
      setCanvasElement(null) // Canvas要素への参照をクリア
    }
  }, [removeNode, zoom, setZoom, resetView, selectedNodeIds, clipboard, addNode, nodes, connections, addConnection])

  // マウスホイールズームとパン機能
  useEffect(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current

    // マウスホイールズーム
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY
      const zoomFactor = delta > 0 ? 0.95 : 1.05
      const newZoom = zoom * zoomFactor
      setZoom(newZoom)
    }

    // パンツール使用時のドラッグ
    const handleMouseDown = (e: any) => {
      if (selectedTool === 'pan') {
        setIsPanning(true)
        const pointer = canvas.getPointer(e.e)
        setLastPanPosition({ x: pointer.x, y: pointer.y })
      }
    }

    const handleMouseMove = (e: any) => {
      if (isPanning && selectedTool === 'pan') {
        const pointer = canvas.getPointer(e.e)
        const deltaX = pointer.x - lastPanPosition.x
        const deltaY = pointer.y - lastPanPosition.y
        setPan(panX + deltaX, panY + deltaY)
        setLastPanPosition({ x: pointer.x, y: pointer.y })
      }
    }

    const handleMouseUp = () => {
      setIsPanning(false)
    }

    const canvasElement = canvas.getElement()
    canvasElement.addEventListener('wheel', handleWheel, { passive: false })
    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      canvasElement.removeEventListener('wheel', handleWheel)
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
    }
  }, [zoom, setZoom, selectedTool, isPanning, lastPanPosition, panX, panY, setPan])

  // ズームとパンの適用
  useEffect(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current

    // Fabric.jsのビューポート変換を適用
    canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY])
    canvas.renderAll()
  }, [zoom, panX, panY])

  // ノードの描画
  useEffect(() => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    canvas.clear()

    nodes.forEach((node) => {
      const fabricObject = createFabricNode(node)
      if (fabricObject) {
        canvas.add(fabricObject)

        // ドラッグイベント
        fabricObject.on('moving', (e: any) => {
          const target = e.target
          if (target && (target as any).nodeId) {
            updateNode((target as any).nodeId, {
              x: target.left || 0,
              y: target.top || 0,
            })
          }
        })

        // 選択イベント
        fabricObject.on('selected', () => {
          if ((fabricObject as any).nodeId) {
            selectNode((fabricObject as any).nodeId)
          }
        })

        // コネクトモードでのクリックイベント
        fabricObject.on('mousedown', () => {
          if (selectedTool === 'connect' && (fabricObject as any).nodeId) {
            const nodeId = (fabricObject as any).nodeId

            if (!connectingFrom) {
              // 最初のノードを選択
              setConnectingFrom(nodeId)
            } else if (connectingFrom !== nodeId) {
              // 2つ目のノードを選択 - 接続を作成
              addConnection({
                id: crypto.randomUUID(),
                fromNodeId: connectingFrom,
                toNodeId: nodeId,
              })
              setConnectingFrom(null)

              // プレビューラインをクリア
              if (previewLine) {
                canvas.remove(previewLine)
                setPreviewLine(null)
              }
            }
          }
        })
      }
    })

    // コネクションの描画
    connections.forEach((connection) => {
      const fromNode = nodes.find((n) => n.id === connection.fromNodeId)
      const toNode = nodes.find((n) => n.id === connection.toNodeId)

      if (fromNode && toNode) {
        const line = new Line(
          [
            fromNode.x + fromNode.width / 2,
            fromNode.y + fromNode.height / 2,
            toNode.x + toNode.width / 2,
            toNode.y + toNode.height / 2,
          ],
          {
            stroke: connection.color || '#333',
            strokeWidth: 2,
            selectable: false,
          }
        )

        // 矢印を追加
        const angle = Math.atan2(
          toNode.y - fromNode.y,
          toNode.x - fromNode.x
        )
        const headlen = 10
        const arrowHead = new Triangle({
          left: toNode.x + toNode.width / 2,
          top: toNode.y + toNode.height / 2,
          angle: (angle * 180) / Math.PI + 90,
          width: headlen,
          height: headlen,
          fill: connection.color || '#333',
          selectable: false,
        })

        canvas.add(line)
        canvas.add(arrowHead)
      }
    })

    canvas.renderAll()
  }, [nodes, connections, updateNode, selectNode, selectedTool, connectingFrom, setConnectingFrom, addConnection, previewLine])

  // プレビューライン（接続中の線）を表示
  useEffect(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current

    if (selectedTool === 'connect' && connectingFrom) {
      const fromNode = nodes.find(n => n.id === connectingFrom)
      if (!fromNode) return

      const handleMouseMove = (e: any) => {
        const pointer = canvas.getPointer(e.e)

        // 既存のプレビューラインを削除
        if (previewLine) {
          canvas.remove(previewLine)
        }

        // 新しいプレビューラインを作成
        const newLine = new Line(
          [
            fromNode.x + fromNode.width / 2,
            fromNode.y + fromNode.height / 2,
            pointer.x,
            pointer.y,
          ],
          {
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          }
        )

        canvas.add(newLine)
        setPreviewLine(newLine)
        canvas.renderAll()
      }

      canvas.on('mouse:move', handleMouseMove)

      return () => {
        canvas.off('mouse:move', handleMouseMove)
        if (previewLine) {
          canvas.remove(previewLine)
        }
      }
    }
  }, [selectedTool, connectingFrom, nodes, previewLine])

  // ローカルストレージから復元（初回マウント時のみ）
  useEffect(() => {
    const savedData = loadFromLocalStorage()
    if (savedData && savedData.nodes.length > 0) {
      if (confirm('前回の作業内容が見つかりました。復元しますか？')) {
        loadWorkflow(savedData.nodes, savedData.connections)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 初回マウント時のみ実行

  // 自動保存（1分ごと + 変更時）
  useEffect(() => {
    // デバウンス用タイマー
    const debounceTimer = setTimeout(() => {
      if (nodes.length > 0 || connections.length > 0) {
        saveToLocalStorage(nodes, connections)
      }
    }, 5000) // 5秒間変更がなければ保存

    // 1分ごとの定期保存
    const intervalId = setInterval(() => {
      if (nodes.length > 0 || connections.length > 0) {
        saveToLocalStorage(nodes, connections)
      }
    }, 60000) // 1分 = 60000ms

    return () => {
      clearTimeout(debounceTimer)
      clearInterval(intervalId)
    }
  }, [nodes, connections])

  // ドラッグ&ドロップでJSONインポート
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'))

    if (!jsonFile) {
      alert('JSONファイルをドロップしてください')
      return
    }

    try {
      const data = await importFromJSON(jsonFile)

      if (confirm(`${data.nodes.length}個のノードと${data.connections.length}個の接続をインポートします。現在のワークフローは上書きされます。よろしいですか？`)) {
        loadWorkflow(data.nodes, data.connections)
      }
    } catch (error) {
      alert(`インポートに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div
      className={`relative w-full h-full bg-gray-50 ${isDragOver ? 'ring-4 ring-blue-500 ring-inset' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} />
      {selectedTool === 'connect' && connectingFrom && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          接続先のノードをクリックしてください
        </div>
      )}
      {isDragOver && (
        <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-500 text-white px-8 py-4 rounded-lg shadow-2xl text-lg font-bold">
            📂 JSONファイルをドロップしてインポート
          </div>
        </div>
      )}
    </div>
  )
}

// ノードの種類に応じたFabricオブジェクトを作成
function createFabricNode(node: Node): FabricObject | null {
  const commonProps = {
    left: node.x,
    top: node.y,
    fill: node.color || getDefaultColor(node.type),
    stroke: node.borderColor || '#333',
    strokeWidth: 2,
    selectable: true,
    hasControls: true,
    hasBorders: true,
  }

  let shape: FabricObject | null = null

  switch (node.type) {
    case 'process':
      shape = new Rect({
        ...commonProps,
        width: node.width,
        height: node.height,
        rx: 5,
        ry: 5,
      })
      break

    case 'decision':
      shape = new Polygon(
        [
          { x: node.width / 2, y: 0 },
          { x: node.width, y: node.height / 2 },
          { x: node.width / 2, y: node.height },
          { x: 0, y: node.height / 2 },
        ],
        commonProps
      )
      break

    case 'start':
      shape = new Ellipse({
        ...commonProps,
        rx: node.width / 2,
        ry: node.height / 2,
      })
      break

    case 'end':
      const group = new Group([
        new Ellipse({
          rx: node.width / 2,
          ry: node.height / 2,
          fill: node.color || '#fee',
          stroke: node.borderColor || '#f33',
          strokeWidth: 2,
        }),
        new Ellipse({
          rx: node.width / 2 - 5,
          ry: node.height / 2 - 5,
          fill: 'transparent',
          stroke: node.borderColor || '#f33',
          strokeWidth: 2,
        }),
      ], {
        left: node.x,
        top: node.y,
        selectable: true,
      })
      shape = group
      break
  }

  if (shape) {
    // ノードIDを保存
    ;(shape as any).nodeId = node.id

    // テキストラベルを追加（グループ化）
    const text = new Text(node.label, {
      fontSize: 14,
      fill: node.textColor || '#000',
      originX: 'center',
      originY: 'center',
    })

    const finalGroup = new Group([shape, text], {
      left: node.x,
      top: node.y,
      selectable: true,
      hasControls: true,
    })
    ;(finalGroup as any).nodeId = node.id

    return finalGroup
  }

  return null
}

function getDefaultColor(type: NodeType): string {
  switch (type) {
    case 'process':
      return '#e3f2fd'
    case 'decision':
      return '#fff9c4'
    case 'start':
      return '#e8f5e9'
    case 'end':
      return '#ffebee'
    default:
      return '#f5f5f5'
  }
}
