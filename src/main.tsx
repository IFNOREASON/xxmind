import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

const tools = [
  {
    id: 'editor',
    name: '图形编辑器',
    icon: '🛠️',
    description: '流程图、鱼骨图、架构图、思维导图等多种图形编辑工具',
    path: '/editor/'
  },
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    icon: '🔧',
    description: '在线JSON格式化、压缩、转义、去转义、错误提示等功能',
    path: '/json-formatter/'
  },
  {
    id: 'url-parser',
    name: 'URL 解析工具',
    icon: '🔗',
    description: '解析URL参数、编码解码、参数拼接等功能',
    path: '/url-parser/'
  },
  {
    id: 'api-tester',
    name: 'API 测试工具',
    icon: '🌐',
    description: 'HTTP接口测试、请求发送、响应查看、历史记录',
    path: '/api-tester/'
  }
]

function App() {
  return (
    <div className="tool-selector-page">
      <header className="selector-header">
        <h1>🛠️ 工具箱</h1>
        <p>选择一个工具开始使用</p>
      </header>
      <main className="selector-content">
        <div className="tool-cards">
          {tools.map((tool) => (
            <a key={tool.id} href={tool.path} className="tool-card">
              <div className="tool-card-icon">{tool.icon}</div>
              <h3 className="tool-card-title">{tool.name}</h3>
              <p className="tool-card-desc">{tool.description}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
