import { create } from 'zustand'
import { CanvasState, Node, Connection } from '@/types/nodes'

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  connections: [],
  selectedNodeIds: [],
  history: {
    past: [],
    future: [],
  },

  addNode: (node: Node) => {
    set((state) => {
      const newState = {
        nodes: [...state.nodes, node],
        connections: state.connections,
      }
      return {
        nodes: newState.nodes,
        history: {
          past: [...state.history.past, { nodes: state.nodes, connections: state.connections }],
          future: [],
        },
      }
    })
  },

  removeNode: (id: string) => {
    set((state) => {
      const newNodes = state.nodes.filter((n) => n.id !== id)
      const newConnections = state.connections.filter(
        (c) => c.fromNodeId !== id && c.toNodeId !== id
      )
      return {
        nodes: newNodes,
        connections: newConnections,
        selectedNodeIds: state.selectedNodeIds.filter((nid) => nid !== id),
        history: {
          past: [...state.history.past, { nodes: state.nodes, connections: state.connections }],
          future: [],
        },
      }
    })
  },

  updateNode: (id: string, updates: Partial<Node>) => {
    set((state) => {
      const newNodes = state.nodes.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      )
      return {
        nodes: newNodes,
        history: {
          past: [...state.history.past, { nodes: state.nodes, connections: state.connections }],
          future: [],
        },
      }
    })
  },

  selectNode: (id: string, multi = false) => {
    set((state) => ({
      selectedNodeIds: multi
        ? state.selectedNodeIds.includes(id)
          ? state.selectedNodeIds.filter((nid) => nid !== id)
          : [...state.selectedNodeIds, id]
        : [id],
    }))
  },

  clearSelection: () => {
    set({ selectedNodeIds: [] })
  },

  addConnection: (connection: Connection) => {
    set((state) => ({
      connections: [...state.connections, connection],
      history: {
        past: [...state.history.past, { nodes: state.nodes, connections: state.connections }],
        future: [],
      },
    }))
  },

  removeConnection: (id: string) => {
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      history: {
        past: [...state.history.past, { nodes: state.nodes, connections: state.connections }],
        future: [],
      },
    }))
  },

  undo: () => {
    set((state) => {
      const { past, future } = state.history
      if (past.length === 0) return state

      const previous = past[past.length - 1]
      const newPast = past.slice(0, -1)

      return {
        nodes: previous.nodes,
        connections: previous.connections,
        history: {
          past: newPast,
          future: [{ nodes: state.nodes, connections: state.connections }, ...future],
        },
      }
    })
  },

  redo: () => {
    set((state) => {
      const { past, future } = state.history
      if (future.length === 0) return state

      const next = future[0]
      const newFuture = future.slice(1)

      return {
        nodes: next.nodes,
        connections: next.connections,
        history: {
          past: [...past, { nodes: state.nodes, connections: state.connections }],
          future: newFuture,
        },
      }
    })
  },
}))
