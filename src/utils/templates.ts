import { Node, Connection } from '@/types/nodes'

export interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  nodes: Node[]
  connections: Connection[]
  thumbnail?: string
  isCustom?: boolean
  createdAt?: string
}

export type TemplateCategory =
  | '承認フロー'
  | 'エラー処理'
  | '並列処理'
  | 'ループ処理'
  | '条件分岐'
  | 'カスタム'

// プリセットテンプレート

/**
 * 承認フローテンプレート
 */
export const approvalFlowTemplate: Template = {
  id: 'preset-approval-flow',
  name: '承認フロー',
  description: '申請 → 承認判断 → 承認/却下のフロー',
  category: '承認フロー',
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      x: 100,
      y: 100,
      width: 100,
      height: 60,
      label: '申請開始',
    },
    {
      id: 'process-1',
      type: 'process',
      x: 100,
      y: 200,
      width: 120,
      height: 60,
      label: '申請内容入力',
    },
    {
      id: 'decision-1',
      type: 'decision',
      x: 100,
      y: 320,
      width: 100,
      height: 100,
      label: '承認判断',
    },
    {
      id: 'process-2',
      type: 'process',
      x: 250,
      y: 320,
      width: 120,
      height: 60,
      label: '承認処理',
    },
    {
      id: 'process-3',
      type: 'process',
      x: -50,
      y: 320,
      width: 120,
      height: 60,
      label: '却下処理',
    },
    {
      id: 'end-1',
      type: 'end',
      x: 100,
      y: 480,
      width: 100,
      height: 60,
      label: '完了',
    },
  ],
  connections: [
    {
      id: 'conn-1',
      fromNodeId: 'start-1',
      toNodeId: 'process-1',
    },
    {
      id: 'conn-2',
      fromNodeId: 'process-1',
      toNodeId: 'decision-1',
    },
    {
      id: 'conn-3',
      fromNodeId: 'decision-1',
      toNodeId: 'process-2',
      label: '承認',
    },
    {
      id: 'conn-4',
      fromNodeId: 'decision-1',
      toNodeId: 'process-3',
      label: '却下',
    },
    {
      id: 'conn-5',
      fromNodeId: 'process-2',
      toNodeId: 'end-1',
    },
    {
      id: 'conn-6',
      fromNodeId: 'process-3',
      toNodeId: 'end-1',
    },
  ],
}

/**
 * エラーハンドリングフローテンプレート
 */
export const errorHandlingTemplate: Template = {
  id: 'preset-error-handling',
  name: 'エラーハンドリング',
  description: '処理実行 → エラー判定 → リトライ/エラー通知',
  category: 'エラー処理',
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      x: 100,
      y: 50,
      width: 100,
      height: 60,
      label: '開始',
    },
    {
      id: 'process-1',
      type: 'process',
      x: 100,
      y: 150,
      width: 120,
      height: 60,
      label: '処理実行',
    },
    {
      id: 'decision-1',
      type: 'decision',
      x: 100,
      y: 250,
      width: 100,
      height: 100,
      label: 'エラー?',
    },
    {
      id: 'process-2',
      type: 'process',
      x: -80,
      y: 250,
      width: 120,
      height: 60,
      label: 'ログ記録',
    },
    {
      id: 'process-3',
      type: 'process',
      x: -80,
      y: 370,
      width: 120,
      height: 60,
      label: 'エラー通知',
    },
    {
      id: 'process-4',
      type: 'process',
      x: 280,
      y: 250,
      width: 120,
      height: 60,
      label: '正常処理',
    },
    {
      id: 'end-1',
      type: 'end',
      x: 100,
      y: 490,
      width: 100,
      height: 60,
      label: '終了',
    },
  ],
  connections: [
    {
      id: 'conn-1',
      fromNodeId: 'start-1',
      toNodeId: 'process-1',
    },
    {
      id: 'conn-2',
      fromNodeId: 'process-1',
      toNodeId: 'decision-1',
    },
    {
      id: 'conn-3',
      fromNodeId: 'decision-1',
      toNodeId: 'process-2',
      label: 'YES',
    },
    {
      id: 'conn-4',
      fromNodeId: 'decision-1',
      toNodeId: 'process-4',
      label: 'NO',
    },
    {
      id: 'conn-5',
      fromNodeId: 'process-2',
      toNodeId: 'process-3',
    },
    {
      id: 'conn-6',
      fromNodeId: 'process-3',
      toNodeId: 'end-1',
    },
    {
      id: 'conn-7',
      fromNodeId: 'process-4',
      toNodeId: 'end-1',
    },
  ],
}

/**
 * 並列処理フローテンプレート
 */
export const parallelProcessingTemplate: Template = {
  id: 'preset-parallel-processing',
  name: '並列処理',
  description: '複数の処理を並列実行して結果を統合',
  category: '並列処理',
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      x: 200,
      y: 50,
      width: 100,
      height: 60,
      label: '開始',
    },
    {
      id: 'process-1',
      type: 'process',
      x: 50,
      y: 180,
      width: 120,
      height: 60,
      label: '処理A',
    },
    {
      id: 'process-2',
      type: 'process',
      x: 200,
      y: 180,
      width: 120,
      height: 60,
      label: '処理B',
    },
    {
      id: 'process-3',
      type: 'process',
      x: 350,
      y: 180,
      width: 120,
      height: 60,
      label: '処理C',
    },
    {
      id: 'process-4',
      type: 'process',
      x: 200,
      y: 310,
      width: 120,
      height: 60,
      label: '結果統合',
    },
    {
      id: 'end-1',
      type: 'end',
      x: 200,
      y: 420,
      width: 100,
      height: 60,
      label: '完了',
    },
  ],
  connections: [
    {
      id: 'conn-1',
      fromNodeId: 'start-1',
      toNodeId: 'process-1',
    },
    {
      id: 'conn-2',
      fromNodeId: 'start-1',
      toNodeId: 'process-2',
    },
    {
      id: 'conn-3',
      fromNodeId: 'start-1',
      toNodeId: 'process-3',
    },
    {
      id: 'conn-4',
      fromNodeId: 'process-1',
      toNodeId: 'process-4',
    },
    {
      id: 'conn-5',
      fromNodeId: 'process-2',
      toNodeId: 'process-4',
    },
    {
      id: 'conn-6',
      fromNodeId: 'process-3',
      toNodeId: 'process-4',
    },
    {
      id: 'conn-7',
      fromNodeId: 'process-4',
      toNodeId: 'end-1',
    },
  ],
}

/**
 * ループ処理フローテンプレート
 */
export const loopProcessingTemplate: Template = {
  id: 'preset-loop-processing',
  name: 'ループ処理',
  description: '条件を満たすまで処理を繰り返す',
  category: 'ループ処理',
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      x: 100,
      y: 50,
      width: 100,
      height: 60,
      label: '開始',
    },
    {
      id: 'process-1',
      type: 'process',
      x: 100,
      y: 150,
      width: 120,
      height: 60,
      label: '初期化',
    },
    {
      id: 'decision-1',
      type: 'decision',
      x: 100,
      y: 250,
      width: 100,
      height: 100,
      label: '継続?',
    },
    {
      id: 'process-2',
      type: 'process',
      x: 280,
      y: 250,
      width: 120,
      height: 60,
      label: 'ループ処理',
    },
    {
      id: 'process-3',
      type: 'process',
      x: 280,
      y: 370,
      width: 120,
      height: 60,
      label: 'カウンタ更新',
    },
    {
      id: 'end-1',
      type: 'end',
      x: 100,
      y: 410,
      width: 100,
      height: 60,
      label: '終了',
    },
  ],
  connections: [
    {
      id: 'conn-1',
      fromNodeId: 'start-1',
      toNodeId: 'process-1',
    },
    {
      id: 'conn-2',
      fromNodeId: 'process-1',
      toNodeId: 'decision-1',
    },
    {
      id: 'conn-3',
      fromNodeId: 'decision-1',
      toNodeId: 'process-2',
      label: 'YES',
    },
    {
      id: 'conn-4',
      fromNodeId: 'decision-1',
      toNodeId: 'end-1',
      label: 'NO',
    },
    {
      id: 'conn-5',
      fromNodeId: 'process-2',
      toNodeId: 'process-3',
    },
    {
      id: 'conn-6',
      fromNodeId: 'process-3',
      toNodeId: 'decision-1',
    },
  ],
}

/**
 * 条件分岐フローテンプレート
 */
export const conditionalBranchingTemplate: Template = {
  id: 'preset-conditional-branching',
  name: '条件分岐',
  description: '複数の条件による分岐処理',
  category: '条件分岐',
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      x: 200,
      y: 50,
      width: 100,
      height: 60,
      label: '開始',
    },
    {
      id: 'process-1',
      type: 'process',
      x: 200,
      y: 150,
      width: 120,
      height: 60,
      label: 'データ取得',
    },
    {
      id: 'decision-1',
      type: 'decision',
      x: 200,
      y: 250,
      width: 100,
      height: 100,
      label: '条件A?',
    },
    {
      id: 'decision-2',
      type: 'decision',
      x: 380,
      y: 250,
      width: 100,
      height: 100,
      label: '条件B?',
    },
    {
      id: 'process-2',
      type: 'process',
      x: 20,
      y: 250,
      width: 120,
      height: 60,
      label: '処理A',
    },
    {
      id: 'process-3',
      type: 'process',
      x: 380,
      y: 400,
      width: 120,
      height: 60,
      label: '処理B',
    },
    {
      id: 'process-4',
      type: 'process',
      x: 560,
      y: 250,
      width: 120,
      height: 60,
      label: 'デフォルト処理',
    },
    {
      id: 'end-1',
      type: 'end',
      x: 200,
      y: 520,
      width: 100,
      height: 60,
      label: '終了',
    },
  ],
  connections: [
    {
      id: 'conn-1',
      fromNodeId: 'start-1',
      toNodeId: 'process-1',
    },
    {
      id: 'conn-2',
      fromNodeId: 'process-1',
      toNodeId: 'decision-1',
    },
    {
      id: 'conn-3',
      fromNodeId: 'decision-1',
      toNodeId: 'process-2',
      label: 'YES',
    },
    {
      id: 'conn-4',
      fromNodeId: 'decision-1',
      toNodeId: 'decision-2',
      label: 'NO',
    },
    {
      id: 'conn-5',
      fromNodeId: 'decision-2',
      toNodeId: 'process-3',
      label: 'YES',
    },
    {
      id: 'conn-6',
      fromNodeId: 'decision-2',
      toNodeId: 'process-4',
      label: 'NO',
    },
    {
      id: 'conn-7',
      fromNodeId: 'process-2',
      toNodeId: 'end-1',
    },
    {
      id: 'conn-8',
      fromNodeId: 'process-3',
      toNodeId: 'end-1',
    },
    {
      id: 'conn-9',
      fromNodeId: 'process-4',
      toNodeId: 'end-1',
    },
  ],
}

// すべてのプリセットテンプレートをエクスポート
export const presetTemplates: Template[] = [
  approvalFlowTemplate,
  errorHandlingTemplate,
  parallelProcessingTemplate,
  loopProcessingTemplate,
  conditionalBranchingTemplate,
]

/**
 * カスタムテンプレートをローカルストレージに保存
 */
export function saveCustomTemplate(template: Template): void {
  const customTemplates = getCustomTemplates()
  const newTemplate: Template = {
    ...template,
    isCustom: true,
    createdAt: new Date().toISOString(),
  }
  customTemplates.push(newTemplate)
  localStorage.setItem('custom-templates', JSON.stringify(customTemplates))
}

/**
 * カスタムテンプレートをローカルストレージから取得
 */
export function getCustomTemplates(): Template[] {
  try {
    const data = localStorage.getItem('custom-templates')
    if (!data) return []
    return JSON.parse(data) as Template[]
  } catch (error) {
    console.error('Failed to load custom templates:', error)
    return []
  }
}

/**
 * カスタムテンプレートを削除
 */
export function deleteCustomTemplate(id: string): void {
  const customTemplates = getCustomTemplates()
  const filtered = customTemplates.filter(t => t.id !== id)
  localStorage.setItem('custom-templates', JSON.stringify(filtered))
}

/**
 * すべてのテンプレート（プリセット + カスタム）を取得
 */
export function getAllTemplates(): Template[] {
  return [...presetTemplates, ...getCustomTemplates()]
}
