export type NodeType = 'process' | 'decision' | 'start' | 'end'

export interface Node {
  id: string
  type: NodeType
  x: number
  y: number
  width: number
  height: number
  label: string
  color?: string
  borderColor?: string
  textColor?: string
  metadata?: Record<string, unknown>
}

export interface Connection {
  id: string
  fromNodeId: string
  toNodeId: string
  label?: string
  color?: string
}

export interface CanvasState {
  nodes: Node[]
  connections: Connection[]
  selectedNodeIds: string[]
  zoom: number
  panX: number
  panY: number
  history: {
    past: { nodes: Node[]; connections: Connection[] }[]
    future: { nodes: Node[]; connections: Connection[] }[]
  }
  addNode: (node: Node) => void
  removeNode: (id: string) => void
  updateNode: (id: string, updates: Partial<Node>) => void
  selectNode: (id: string, multi?: boolean) => void
  clearSelection: () => void
  addConnection: (connection: Connection) => void
  removeConnection: (id: string) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  resetView: () => void
  undo: () => void
  redo: () => void
  loadWorkflow: (nodes: Node[], connections: Connection[]) => void
  clearWorkflow: () => void
}

export type ToolType = 'select' | 'pan' | 'connect' | 'delete'
