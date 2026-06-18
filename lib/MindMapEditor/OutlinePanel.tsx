import { useState, useRef, useEffect } from 'react'
import { Graph, Node } from '@antv/x6'
import { MindMapNodeData } from './types'
import { MindMapShapeManager } from './MindMapShapeManager'
import './OutlinePanel.css'

interface OutlinePanelProps {
  graph: Graph | null
  shapeManager: MindMapShapeManager | null
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

interface OutlineNode {
  id: string
  label: string
  level: number
  children: OutlineNode[]
  direction?: 'left' | 'right'
  fillColor?: string
  fontColor?: string
}

export default function OutlinePanel({
  graph,
  shapeManager,
  selectedNodeId,
  onSelectNode,
  collapsed,
  onToggleCollapsed,
}: OutlinePanelProps) {
  const [tree, setTree] = useState<OutlineNode | null>(null)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef<HTMLInputElement | null>(null)
  const versionRef = useRef(0)

  const buildTree = (): OutlineNode | null => {
    if (!graph) return null
    const nodes = graph.getNodes()
    const rootNode = nodes.find((n) => n.getData()?.level === 'root')
    if (!rootNode) return null

    const nodeMap = new Map<string, Node>()
    nodes.forEach((n) => nodeMap.set(n.id, n))

    const buildNode = (node: Node, level: number): OutlineNode => {
      const data = node.getData() as MindMapNodeData
      const children: OutlineNode[] = []
      if (data?.children) {
        data.children.forEach((childId) => {
          const childNode = nodeMap.get(childId)
          if (childNode) {
            children.push(buildNode(childNode, level + 1))
          }
        })
      }
      return {
        id: node.id,
        label: data?.label || '',
        level,
        children,
        direction: data?.direction,
        fillColor: data?.fillColor,
        fontColor: data?.fontColor,
      }
    }

    return buildNode(rootNode, 0)
  }

  useEffect(() => {
    if (!graph) return

    const updateTree = () => {
      versionRef.current += 1
      setTree(buildTree())
    }

    updateTree()

    graph.on('node:added', updateTree)
    graph.on('node:removed', updateTree)
    graph.on('node:changed', updateTree)
    graph.on('edge:added', updateTree)
    graph.on('edge:removed', updateTree)
    graph.on('history:change', updateTree)

    return () => {
      graph.off('node:added', updateTree)
      graph.off('node:removed', updateTree)
      graph.off('node:changed', updateTree)
      graph.off('edge:added', updateTree)
      graph.off('edge:removed', updateTree)
      graph.off('history:change', updateTree)
    }
  }, [graph])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const countNodes = (node: OutlineNode | null): number => {
    if (!node) return 0
    let count = 1
    node.children.forEach((child) => {
      count += countNodes(child)
    })
    return count
  }

  const handleClickNode = (nodeId: string) => {
    if (editingId) return
    onSelectNode(nodeId)
    if (graph) {
      const node = graph.getCellById(nodeId) as Node
      if (node) {
        graph.cleanSelection()
        graph.select(node)
        const bbox = node.getBBox()
        graph.centerPoint(bbox.center.x, bbox.center.y)
      }
    }
  }

  const toggleNodeCollapse = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setCollapsedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const handleDoubleClick = (e: React.MouseEvent, node: OutlineNode) => {
    e.stopPropagation()
    if (node.id === 'root') {
      const data = graph?.getCellById(node.id)?.getData() as MindMapNodeData
      if (data?.level === 'root') {
      }
    }
    setEditingId(node.id)
    setEditValue(node.label)
  }

  const finishEdit = (commit: boolean) => {
    if (editingId && commit && shapeManager && graph) {
      const node = graph.getCellById(editingId) as Node
      if (node) {
        shapeManager.updateNodeStyle(node, { label: editValue })
        shapeManager.layoutNodes()
      }
    }
    setEditingId(null)
    setEditValue('')
  }

  const renderNode = (node: OutlineNode): JSX.Element => {
    const isCollapsed = collapsedNodes.has(node.id)
    const isSelected = selectedNodeId === node.id
    const hasChildren = node.children.length > 0
    const isEditing = editingId === node.id

    return (
      <div key={node.id}>
        <div
          className={`outline-item ${isSelected ? 'selected' : ''} level-${Math.min(node.level, 2)}`}
          style={{ paddingLeft: `${node.level * 16 + 8}px` }}
          onClick={() => handleClickNode(node.id)}
          onDoubleClick={(e) => handleDoubleClick(e, node)}
        >
          {hasChildren ? (
            <button
              className={`collapse-btn ${isCollapsed ? 'collapsed' : ''}`}
              onClick={(e) => toggleNodeCollapse(e, node.id)}
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
          ) : (
            <span className="collapse-placeholder" />
          )}

          <span
            className="level-dot"
            style={{ backgroundColor: node.fillColor || '#2d3436' }}
          />

          {isEditing ? (
            <input
              ref={editInputRef}
              className="outline-edit-input"
              value={editValue}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => finishEdit(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  finishEdit(true)
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  finishEdit(false)
                }
              }}
            />
          ) : (
            <span className="outline-label">{node.label}</span>
          )}
        </div>
        {hasChildren && !isCollapsed && (
          <div className="outline-children">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    )
  }

  const totalNodes = countNodes(tree)

  if (collapsed) {
    return (
      <div className="outline-panel collapsed">
        <button
          className="outline-toggle-btn collapsed-toggle"
          onClick={onToggleCollapsed}
          title="展开大纲"
        >
          ◀
        </button>
      </div>
    )
  }

  return (
    <div className="outline-panel">
      <div className="outline-header">
        <span className="outline-title">大纲</span>
        <span className="outline-count">{totalNodes} 个节点</span>
        <button
          className="outline-toggle-btn"
          onClick={onToggleCollapsed}
          title="收起大纲"
        >
          ▶
        </button>
      </div>
      <div className="outline-content">
        {tree ? renderNode(tree) : (
          <div className="outline-empty">暂无节点</div>
        )}
      </div>
      <div className="outline-footer">
        <div className="outline-hint">点击选中 · 双击编辑</div>
      </div>
    </div>
  )
}
