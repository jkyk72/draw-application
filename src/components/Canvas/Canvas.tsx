import { useEffect, useRef, useState } from 'react'
import { Canvas as FabricCanvas, Rect, Polygon, Ellipse, Group, Line, Triangle, Text, Object as FabricObject } from 'fabric'
import { useCanvasStore } from '@/store/canvasStore'
import { useToolStore } from '@/store/toolStore'
import { Node, NodeType } from '@/types/nodes'

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<FabricCanvas | null>(null)
  const { nodes, connections, updateNode, selectNode, removeNode, addConnection } = useCanvasStore()
  const { selectedTool, connectingFrom, setConnectingFrom } = useToolStore()
  const [previewLine, setPreviewLine] = useState<Line | null>(null)

  // Fabric.jsの初期化
  useEffect(() => {
    if (!canvasRef.current) return

    fabricCanvasRef.current = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 256 - 384, // Toolbar (256px) + ChatPanel (384px)
      height: window.innerHeight - 64, // Header (64px)
      backgroundColor: '#ffffff',
      selection: true,
    })

    // キーボードイベント
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = fabricCanvasRef.current?.getActiveObject()
        if (activeObject && (activeObject as any).nodeId) {
          removeNode((activeObject as any).nodeId)
        }
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
    }
  }, [removeNode])

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

  return (
    <div className="relative w-full h-full bg-gray-50">
      <canvas ref={canvasRef} />
      {selectedTool === 'connect' && connectingFrom && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          接続先のノードをクリックしてください
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
