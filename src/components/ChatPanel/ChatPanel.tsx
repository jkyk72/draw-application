import { useState, useRef, useEffect } from 'react'
import { useCanvasStore } from '@/store/canvasStore'
import { processNaturalLanguageCommand } from '@/utils/ai'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const ChatPanel = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'こんにちは！ワークフロー図の編集をお手伝いします。自然言語で指示してください。',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { nodes, connections, addNode, removeNode, updateNode, addConnection } = useCanvasStore()

  // メッセージ表示を最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Claude APIに送信
      const context = {
        nodes,
        connections,
        instruction: input
      }

      const result = await processNaturalLanguageCommand(context)

      // 操作を実行
      result.operations.forEach(op => {
        if (op.type === 'add' && op.node) {
          addNode({
            id: op.node.id || crypto.randomUUID(),
            type: op.node.type || 'process',
            x: op.node.x || 400,
            y: op.node.y || 300,
            width: op.node.width || 120,
            height: op.node.height || 60,
            label: op.node.label || '新しいノード',
            color: op.node.color,
            borderColor: op.node.borderColor,
            textColor: op.node.textColor
          })
        } else if (op.type === 'remove' && op.nodeId) {
          removeNode(op.nodeId)
        } else if (op.type === 'update' && op.nodeId && op.updates) {
          updateNode(op.nodeId, op.updates)
        } else if (op.type === 'connect' && op.connection) {
          addConnection({
            id: op.connection.id || crypto.randomUUID(),
            fromNodeId: op.connection.fromNodeId || '',
            toNodeId: op.connection.toNodeId || '',
            label: op.connection.label,
            color: op.connection.color
          })
        }
      })

      const aiMessage: Message = {
        role: 'assistant',
        content: result.explanation || '操作を実行しました。',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error processing command:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'エラーが発生しました。APIキーが設定されているか確認してください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 音声認識
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('このブラウザは音声認識に対応していません')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <div className="w-96 bg-gray-50 border-l flex flex-col h-full">
      {/* ヘッダー */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-bold text-gray-800">AI アシスタント</h2>
        <p className="text-xs text-gray-600 mt-1">
          自然言語でワークフローを編集
        </p>
      </div>

      {/* メッセージ履歴 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="p-4 border-t bg-white">
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="指示を入力... (例: プロセスノードを追加して)"
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isLoading}
          />

          <div className="flex gap-2">
            <button
              onClick={startListening}
              disabled={isLoading || isListening}
              className={`p-3 rounded-lg border transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-white hover:bg-gray-50'
              }`}
              title="音声入力"
            >
              {isListening ? '🎤 聞き取り中...' : '🎤'}
            </button>

            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isLoading ? '処理中...' : '送信'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Enter で送信 / Shift+Enter で改行
          </p>
        </div>
      </div>
    </div>
  )
}
