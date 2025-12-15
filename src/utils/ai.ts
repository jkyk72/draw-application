import Anthropic from '@anthropic-ai/sdk'
import { Node, Connection } from '@/types/nodes'

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true, // ブラウザから直接APIを呼び出す
})

export interface AIOperation {
  type: 'add' | 'remove' | 'update' | 'connect'
  nodeId?: string
  node?: Partial<Node>
  updates?: Partial<Node>
  connection?: Partial<Connection>
}

export interface AIResponse {
  operations: AIOperation[]
  explanation: string
}

export async function processNaturalLanguageCommand(context: {
  nodes: Node[]
  connections: Connection[]
  instruction: string
}): Promise<AIResponse> {
  const systemPrompt = `あなたはワークフロー図エディタのAIアシスタントです。
ユーザーの自然言語指示を理解し、具体的な操作コマンドに変換してください。

現在のワークフロー図の状態:
ノード数: ${context.nodes.length}
ノード一覧: ${JSON.stringify(context.nodes.map(n => ({ id: n.id, type: n.type, label: n.label, x: n.x, y: n.y })))}
接続数: ${context.connections.length}
接続一覧: ${JSON.stringify(context.connections)}

ユーザー指示: "${context.instruction}"

以下のJSON形式で応答してください（必ずJSON形式のみで応答し、他の文章は含めないでください）:
{
  "operations": [
    {
      "type": "add",
      "node": {
        "id": "新しいUUID",
        "type": "process|decision|start|end",
        "x": 数値,
        "y": 数値,
        "width": 数値,
        "height": 数値,
        "label": "ラベル"
      }
    },
    {
      "type": "remove",
      "nodeId": "削除するノードのID"
    },
    {
      "type": "update",
      "nodeId": "更新するノードのID",
      "updates": {
        "x": 新しいx座標,
        "y": 新しいy座標,
        "label": "新しいラベル"
      }
    },
    {
      "type": "connect",
      "connection": {
        "id": "新しいUUID",
        "fromNodeId": "開始ノードID",
        "toNodeId": "終了ノードID",
        "label": "接続のラベル（オプション）"
      }
    }
  ],
  "explanation": "実行した操作の日本語説明"
}

重要な注意事項:
- 新しいノードのIDは必ずcrypto.randomUUID()で生成してください
- ノードの座標は既存ノードと重ならないように配置してください
- プロセスノードのデフォルトサイズは width: 120, height: 60
- 判断ノードのデフォルトサイズは width: 100, height: 100
- 開始/終了ノードのデフォルトサイズは width: 100, height: 100
- 操作は配列の順序で実行されます`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: systemPrompt }
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      // レスポンスからJSON部分を抽出
      const text = content.text.trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])

        // IDを生成
        result.operations = result.operations.map((op: AIOperation) => {
          if (op.type === 'add' && op.node) {
            return {
              ...op,
              node: {
                ...op.node,
                id: crypto.randomUUID()
              }
            }
          }
          if (op.type === 'connect' && op.connection) {
            return {
              ...op,
              connection: {
                ...op.connection,
                id: crypto.randomUUID()
              }
            }
          }
          return op
        })

        return result as AIResponse
      }
    }

    throw new Error('Invalid response format from Claude')
  } catch (error) {
    console.error('AI processing error:', error)
    return {
      operations: [],
      explanation: 'エラーが発生しました。もう一度お試しください。'
    }
  }
}

// デフォルトの座標を計算（既存ノードと重ならないように）
export function calculateDefaultPosition(
  existingNodes: Node[]
): { x: number; y: number } {
  if (existingNodes.length === 0) {
    return { x: 400, y: 300 }
  }

  // 最後に追加されたノードの右側に配置
  const lastNode = existingNodes[existingNodes.length - 1]
  return {
    x: lastNode.x + 200,
    y: lastNode.y
  }
}
