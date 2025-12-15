import { Node, Connection } from '@/types/nodes'

export interface WorkflowData {
  version: string
  nodes: Node[]
  connections: Connection[]
  metadata?: {
    createdAt: string
    updatedAt: string
    name?: string
    description?: string
  }
}

/**
 * JSONとしてワークフローをエクスポート
 */
export function exportToJSON(
  nodes: Node[],
  connections: Connection[],
  filename: string = 'workflow.json'
): void {
  const data: WorkflowData = {
    version: '1.0.0',
    nodes,
    connections,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * JSONファイルからワークフローをインポート
 */
export async function importFromJSON(file: File): Promise<WorkflowData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data: WorkflowData = JSON.parse(content)

        // バリデーション
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid workflow data: nodes array is missing')
        }
        if (!data.connections || !Array.isArray(data.connections)) {
          throw new Error('Invalid workflow data: connections array is missing')
        }

        // ノードのバリデーション
        data.nodes.forEach((node, index) => {
          if (!node.id || !node.type || node.x === undefined || node.y === undefined) {
            throw new Error(`Invalid node at index ${index}`)
          }
        })

        // 接続のバリデーション
        data.connections.forEach((conn, index) => {
          if (!conn.id || !conn.fromNodeId || !conn.toNodeId) {
            throw new Error(`Invalid connection at index ${index}`)
          }
        })

        resolve(data)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * PNGとしてエクスポート
 */
export function exportToPNG(
  canvas: HTMLCanvasElement,
  filename: string = 'workflow.png',
  backgroundColor: string = '#ffffff'
): void {
  // 一時的なキャンバスを作成して背景色を設定
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height

  const ctx = tempCanvas.getContext('2d')
  if (!ctx) return

  // 背景色を塗る
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

  // 元のキャンバスを描画
  ctx.drawImage(canvas, 0, 0)

  // PNG としてエクスポート
  tempCanvas.toBlob((blob) => {
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }, 'image/png')
}

/**
 * SVGとしてエクスポート
 */
export function exportToSVG(
  nodes: Node[],
  connections: Connection[],
  filename: string = 'workflow.svg'
): void {
  // SVGの範囲を計算
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  nodes.forEach(node => {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + node.width)
    maxY = Math.max(maxY, node.y + node.height)
  })

  const padding = 50
  const width = maxX - minX + padding * 2
  const height = maxY - minY + padding * 2

  // SVG文字列を構築
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX - padding} ${minY - padding} ${width} ${height}">
  <rect x="${minX - padding}" y="${minY - padding}" width="${width}" height="${height}" fill="#ffffff"/>
`

  // 接続を描画
  connections.forEach(conn => {
    const fromNode = nodes.find(n => n.id === conn.fromNodeId)
    const toNode = nodes.find(n => n.id === conn.toNodeId)

    if (fromNode && toNode) {
      const x1 = fromNode.x + fromNode.width / 2
      const y1 = fromNode.y + fromNode.height / 2
      const x2 = toNode.x + toNode.width / 2
      const y2 = toNode.y + toNode.height / 2

      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${conn.color || '#333'}" stroke-width="2"/>\n`

      // 矢印
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const arrowSize = 10
      const arrowX1 = x2 - arrowSize * Math.cos(angle - Math.PI / 6)
      const arrowY1 = y2 - arrowSize * Math.sin(angle - Math.PI / 6)
      const arrowX2 = x2 - arrowSize * Math.cos(angle + Math.PI / 6)
      const arrowY2 = y2 - arrowSize * Math.sin(angle + Math.PI / 6)

      svg += `  <polygon points="${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}" fill="${conn.color || '#333'}"/>\n`
    }
  })

  // ノードを描画
  nodes.forEach(node => {
    const color = node.color || getDefaultColor(node.type)
    const borderColor = node.borderColor || '#333'

    switch (node.type) {
      case 'process':
        svg += `  <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" fill="${color}" stroke="${borderColor}" stroke-width="2" rx="5"/>\n`
        break
      case 'decision':
        const cx = node.x + node.width / 2
        const cy = node.y + node.height / 2
        svg += `  <polygon points="${cx},${node.y} ${node.x + node.width},${cy} ${cx},${node.y + node.height} ${node.x},${cy}" fill="${color}" stroke="${borderColor}" stroke-width="2"/>\n`
        break
      case 'start':
        svg += `  <ellipse cx="${node.x + node.width / 2}" cy="${node.y + node.height / 2}" rx="${node.width / 2}" ry="${node.height / 2}" fill="${color}" stroke="${borderColor}" stroke-width="2"/>\n`
        break
      case 'end':
        svg += `  <ellipse cx="${node.x + node.width / 2}" cy="${node.y + node.height / 2}" rx="${node.width / 2}" ry="${node.height / 2}" fill="${color}" stroke="${borderColor}" stroke-width="2"/>\n`
        svg += `  <ellipse cx="${node.x + node.width / 2}" cy="${node.y + node.height / 2}" rx="${node.width / 2 - 5}" ry="${node.height / 2 - 5}" fill="none" stroke="${borderColor}" stroke-width="2"/>\n`
        break
    }

    // テキストラベル
    svg += `  <text x="${node.x + node.width / 2}" y="${node.y + node.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="${node.textColor || '#000'}">${node.label}</text>\n`
  })

  svg += '</svg>'

  // ダウンロード
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

function getDefaultColor(type: string): string {
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

/**
 * ローカルストレージに保存
 */
export function saveToLocalStorage(
  nodes: Node[],
  connections: Connection[],
  key: string = 'workflow-autosave'
): void {
  const data: WorkflowData = {
    version: '1.0.0',
    nodes,
    connections,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

/**
 * ローカルストレージから読み込み
 */
export function loadFromLocalStorage(
  key: string = 'workflow-autosave'
): WorkflowData | null {
  try {
    const data = localStorage.getItem(key)
    if (!data) return null

    const parsed: WorkflowData = JSON.parse(data)
    return parsed
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return null
  }
}

/**
 * ローカルストレージをクリア
 */
export function clearLocalStorage(key: string = 'workflow-autosave'): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}
