import { useState, useCallback, useMemo } from 'react'
import './JsonFormatter.css'

const JsonFormatter: React.FC = () => {
  const sampleData = useMemo(() => JSON.stringify({
    "name": "JSON 格式化工具",
    "version": "1.0.0",
    "features": ["格式化", "压缩", "转义", "去转义"],
    "config": {
      "theme": "default",
      "autoFormat": true,
      "indentSize": 2
    },
    "isActive": true,
    "count": 12345,
    "nullable": null
  }, null, 2), [])

  const [input, setInput] = useState(sampleData)
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorPosition, setErrorPosition] = useState<{ line: number; column: number } | null>(null)

  const formattedOutput = useMemo(() => {
    if (!input.trim()) {
      setParseError(null)
      setErrorPosition(null)
      return ''
    }

    try {
      const parsed = JSON.parse(input)
      setParseError(null)
      setErrorPosition(null)
      return JSON.stringify(parsed, null, 2)
    } catch (e: any) {
      setParseError(e.message)
      
      const match = e.message.match(/at position (\d+)/)
      if (match) {
        const position = parseInt(match[1])
        const lines = input.substring(0, position).split('\n')
        setErrorPosition({
          line: lines.length,
          column: lines[lines.length - 1].length + 1
        })
      } else {
        setErrorPosition(null)
      }
      return ''
    }
  }, [input])

  const stats = useMemo(() => {
    const chars = input.length
    const lines = input ? input.split('\n').length : 0
    return { chars, lines }
  }, [input])

  const handleFormat = useCallback(() => {
    if (formattedOutput) {
      setInput(formattedOutput)
    }
  }, [formattedOutput])

  const handleCompress = useCallback(() => {
    if (formattedOutput) {
      try {
        const parsed = JSON.parse(formattedOutput)
        setInput(JSON.stringify(parsed))
      } catch {}
    }
  }, [formattedOutput])

  const handleCopy = useCallback(async () => {
    if (formattedOutput) {
      await navigator.clipboard.writeText(formattedOutput)
    }
  }, [formattedOutput])

  const handleEscape = useCallback(() => {
    const escaped = input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
    setInput(escaped)
  }, [input])

  const handleUnescape = useCallback(() => {
    try {
      const unescaped = JSON.parse(`"${input}"`)
      setInput(unescaped)
    } catch {
      const unescaped = input
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
      setInput(unescaped)
    }
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
  }, [])

  return (
    <div className="json-formatter-container">
      <div className="json-toolbar">
        <button className="json-btn json-btn-primary" onClick={handleFormat}>
          <span>✨</span> 格式化
        </button>
        <button className="json-btn" onClick={handleCompress}>
          <span>📦</span> 压缩
        </button>
        <button className="json-btn" onClick={handleCopy}>
          <span>📋</span> 复制结果
        </button>
        <button className="json-btn" onClick={handleEscape}>
          <span>🔗</span> 转义
        </button>
        <button className="json-btn" onClick={handleUnescape}>
          <span>🔓</span> 去转义
        </button>
        <button className="json-btn json-btn-danger" onClick={handleClear}>
          <span>🗑️</span> 清空
        </button>
      </div>
      
      <div className="json-panels">
        <div className="json-panel left-panel">
          <div className="json-panel-header">
            <span className="json-panel-title">输入 JSON</span>
            <span className="json-stats">{stats.chars} 字符 | {stats.lines} 行</span>
          </div>
          <textarea
            className="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴 JSON 字符串..."
            spellCheck={false}
          />
          {parseError && (
            <div className="json-error">
              <strong>JSON 语法错误</strong>
              <div>{parseError}</div>
              {errorPosition && (
                <div>位置: 第 {errorPosition.line} 行, 第 {errorPosition.column} 列</div>
              )}
            </div>
          )}
        </div>
        
        <div className="json-panel right-panel">
          <div className="json-panel-header">
            <span className="json-panel-title">格式化结果</span>
          </div>
          <pre className="json-output">
            {formattedOutput || (input.trim() ? 'JSON 格式错误' : '请在左侧输入 JSON')}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default JsonFormatter
