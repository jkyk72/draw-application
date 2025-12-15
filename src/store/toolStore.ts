import { create } from 'zustand'
import { ToolType } from '@/types/nodes'

interface ToolState {
  selectedTool: ToolType
  setSelectedTool: (tool: ToolType) => void
  connectingFrom: string | null
  setConnectingFrom: (nodeId: string | null) => void
}

export const useToolStore = create<ToolState>((set) => ({
  selectedTool: 'select',
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  connectingFrom: null,
  setConnectingFrom: (nodeId) => set({ connectingFrom: nodeId }),
}))
