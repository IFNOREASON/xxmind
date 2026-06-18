import { Graph, Node, Edge } from '@antv/x6'
import { MindMapNodeData, MindMapNodeLevel } from './types'

export const NODE_COLORS = [
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#ffeaa7',
  '#fd79a8',
  '#a29bfe',
  '#74b9ff',
  '#ff7675',
  '#fdcb6e',
  '#e17055',
  '#00b894',
  '#6c5ce7',
]

export class MindMapShapeManager {
  private graph: Graph

  constructor(graph: Graph) {
    this.graph = graph
  }

  createRootNode(label: string, x: number = 400, y: number = 300): Node {
    const node = this.graph.addNode({
      id: 'root-' + Date.now(),
      shape: 'rect',
      x,
      y,
      width: 160,
      height: 60,
      attrs: {
        body: {
          rx: 30,
          ry: 30,
          fill: '#2d3436',
          stroke: '#1e272e',
          strokeWidth: 2,
        },
        label: {
          text: label,
          fill: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      data: {
        id: 'root-' + Date.now(),
        label,
        level: 'root',
        fillColor: '#2d3436',
        fontColor: '#ffffff',
        children: [],
      } as MindMapNodeData,
    })

    return node
  }

  createPrimaryNode(label: string, rootId: string, direction: 'left' | 'right' = 'right'): Node {
    const rootNode = this.graph.getCellById(rootId) as Node
    const rootData = rootNode.getData() as MindMapNodeData

    const primaryNodes = this.graph.getNodes().filter(
      (n) => n.getData()?.level === 'primary' && n.getData()?.direction === direction
    )
    const index = primaryNodes.length
    const color = NODE_COLORS[index % NODE_COLORS.length]

    const node = this.graph.addNode({
      id: 'primary-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      shape: 'rect',
      x: 0,
      y: 0,
      width: 140,
      height: 50,
      attrs: {
        body: {
          rx: 25,
          ry: 25,
          fill: color,
          stroke: color,
          strokeWidth: 2,
        },
        label: {
          text: label,
          fill: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      data: {
        id: 'primary-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        label,
        level: 'primary',
        fillColor: color,
        fontColor: '#ffffff',
        parentId: rootId,
        children: [],
        direction,
      } as MindMapNodeData,
    })

    if (rootData) {
      rootNode.setData({
        ...rootData,
        children: [...(rootData.children || []), node.id],
      })
    }

    this.createEdge(rootNode, node, color, direction)

    return node
  }

  createSecondaryNode(label: string, parentId: string): Node {
    const parentNode = this.graph.getCellById(parentId) as Node
    const parentData = parentNode.getData() as MindMapNodeData
    const color = parentData.fillColor
    const direction = parentData.direction || 'right'

    const node = this.graph.addNode({
      id: 'secondary-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      shape: 'rect',
      x: 0,
      y: 0,
      width: 110,
      height: 36,
      attrs: {
        body: {
          rx: 18,
          ry: 18,
          fill: color,
          stroke: color,
          strokeWidth: 1.5,
          opacity: 0.85,
        },
        label: {
          text: label,
          fill: '#ffffff',
          fontSize: 14,
        },
      },
      data: {
        id: 'secondary-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        label,
        level: 'secondary',
        fillColor: color,
        fontColor: '#ffffff',
        parentId,
        children: [],
        direction,
      } as MindMapNodeData,
    })

    if (parentData) {
      parentNode.setData({
        ...parentData,
        children: [...(parentData.children || []), node.id],
      })
    }

    this.createEdge(parentNode, node, color, direction)

    return node
  }

  private createEdge(source: Node, target: Node, color: string, direction: 'left' | 'right'): Edge {
    const sourceAnchor = direction === 'right' ? 'right' : 'left'
    const targetAnchor = direction === 'right' ? 'left' : 'right'

    return this.graph.addEdge({
      source: { cell: source.id, anchor: { name: sourceAnchor } },
      target: { cell: target.id, anchor: { name: targetAnchor } },
      connector: { name: 'smooth', args: { direction: direction } },
      router: { name: 'normal' },
      attrs: {
        line: {
          stroke: color,
          strokeWidth: 3,
          sourceMarker: null,
          targetMarker: null,
          strokeLinecap: 'round',
        },
      },
      zIndex: 0,
    })
  }

  updateAllEdges() {
    const edges = this.graph.getEdges()
    edges.forEach((edge) => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()

      if (sourceId && targetId) {
        const source = this.graph.getCellById(sourceId) as Node
        const target = this.graph.getCellById(targetId) as Node

        if (source && target) {
          const targetData = target.getData() as MindMapNodeData
          const direction = targetData?.direction || 'right'
          const sourceAnchor = direction === 'right' ? 'right' : 'left'
          const targetAnchor = direction === 'right' ? 'left' : 'right'

          edge.setSource({ cell: sourceId, anchor: { name: sourceAnchor } })
          edge.setTarget({ cell: targetId, anchor: { name: targetAnchor } })
        }
      }
    })
  }

  layoutNodes() {
    const rootNode = this.graph.getNodes().find((n) => n.getData()?.level === 'root')
    if (!rootNode) return

    const rootBBox = rootNode.getBBox()
    const rootCenter = { x: rootBBox.center.x, y: rootBBox.center.y }

    const primaryRight = this.graph.getNodes().filter(
      (n) => n.getData()?.level === 'primary' && n.getData()?.direction === 'right'
    )
    const primaryLeft = this.graph.getNodes().filter(
      (n) => n.getData()?.level === 'primary' && n.getData()?.direction === 'left'
    )

    const primaryHeight = 50
    const primarySpacing = 40
    const primaryOffsetX = 100

    const calculateTreeHeight = (parentNode: Node, level: 'primary' | 'secondary'): number => {
      const nodeHeight = level === 'primary' ? primaryHeight : 36
      const spacing = level === 'primary' ? primarySpacing : 25

      const data = parentNode.getData() as MindMapNodeData
      if (!data?.children || data.children.length === 0) {
        return nodeHeight
      }

      let totalChildrenHeight = 0
      data.children.forEach((childId) => {
        const childNode = this.graph.getCellById(childId) as Node
        if (childNode) {
          totalChildrenHeight += calculateTreeHeight(childNode, 'secondary')
        }
      })

      if (data.children.length > 1) {
        totalChildrenHeight += (data.children.length - 1) * spacing
      }

      return Math.max(nodeHeight, totalChildrenHeight)
    }

    const layoutPrimaryGroup = (nodes: Node[], direction: 'left' | 'right') => {
      if (nodes.length === 0) return

      const treeHeights = nodes.map((node) => calculateTreeHeight(node, 'primary'))
      const totalHeight = treeHeights.reduce((sum, h) => sum + h, 0) + (nodes.length - 1) * primarySpacing
      let currentY = rootCenter.y - totalHeight / 2

      nodes.forEach((node, index) => {
        const nodeBBox = node.getBBox()
        const treeHeight = treeHeights[index]

        let x: number
        if (direction === 'right') {
          x = rootBBox.x + rootBBox.width + primaryOffsetX
        } else {
          x = rootBBox.x - primaryOffsetX - nodeBBox.width
        }

        const y = currentY + treeHeight / 2 - nodeBBox.height / 2
        node.position(x, y)

        this.layoutSecondaryNodes(node, treeHeight, direction)

        currentY += treeHeight + primarySpacing
      })
    }

    layoutPrimaryGroup(primaryRight, 'right')
    layoutPrimaryGroup(primaryLeft, 'left')

    this.updateAllEdges()
  }

  private layoutSecondaryNodes(parentNode: Node, parentTreeHeight: number, direction: 'left' | 'right') {
    const parentData = parentNode.getData() as MindMapNodeData
    if (!parentData?.children || parentData.children.length === 0) return

    const secondaryHeight = 36
    const secondarySpacing = 25
    const secondaryOffsetX = 80

    const children = parentData.children
      .map((id) => this.graph.getCellById(id) as Node)
      .filter((n) => n)

    const totalHeight = children.length * secondaryHeight + (children.length - 1) * secondarySpacing
    const parentBBox = parentNode.getBBox()
    const startY = parentBBox.center.y - parentTreeHeight / 2 + (parentTreeHeight - totalHeight) / 2

    children.forEach((node, index) => {
      const nodeBBox = node.getBBox()
      let x: number
      if (direction === 'right') {
        x = parentBBox.x + parentBBox.width + secondaryOffsetX
      } else {
        x = parentBBox.x - secondaryOffsetX - nodeBBox.width
      }
      const y = startY + index * (secondaryHeight + secondarySpacing)
      node.position(x, y)
    })
  }

  updateNodePosition(node: Node, x: number, y: number) {
    node.position(x, y)
    this.updateConnectedEdges(node)
  }

  updateNodeStyle(node: Node, updates: { fillColor?: string; fontColor?: string; label?: string }) {
    const data = node.getData() as MindMapNodeData
    if (!data) return

    if (updates.fillColor) {
      node.attr('body/fill', updates.fillColor)
      node.attr('body/stroke', updates.fillColor)
      node.setData({ ...data, fillColor: updates.fillColor })

      const edges = this.graph.getEdges()
      edges.forEach((edge) => {
        if (edge.getSourceCellId() === node.id) {
          edge.attr('line/stroke', updates.fillColor)
        }
      })
    }

    if (updates.fontColor) {
      node.attr('label/fill', updates.fontColor)
      node.setData({ ...data, fontColor: updates.fontColor })
    }

    if (updates.label !== undefined) {
      node.attr('label/text', updates.label)
      node.setData({ ...data, label: updates.label })
    }
  }

  updateConnectedEdges(node: Node) {
    const edges = this.graph.getEdges()
    edges.forEach((edge) => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()

      if (sourceId === node.id || targetId === node.id) {
        const source = this.graph.getCellById(sourceId) as Node
        const target = this.graph.getCellById(targetId) as Node

        if (source && target) {
          const targetData = target.getData() as MindMapNodeData
          const direction = targetData?.direction || 'right'
          const sourceAnchor = direction === 'right' ? 'right' : 'left'
          const targetAnchor = direction === 'right' ? 'left' : 'right'

          edge.setSource({ cell: sourceId, anchor: { name: sourceAnchor } })
          edge.setTarget({ cell: targetId, anchor: { name: targetAnchor } })
        }
      }
    })
  }

  private isDescendant(ancestorId: string, nodeId: string): boolean {
    const node = this.graph.getCellById(nodeId) as Node
    if (!node) return false
    const data = node.getData() as MindMapNodeData
    if (!data?.children || data.children.length === 0) return false
    if (data.children.includes(ancestorId)) return true
    return data.children.some((childId) => this.isDescendant(ancestorId, childId))
  }

  moveNode(nodeId: string, targetParentId: string): boolean {
    const node = this.graph.getCellById(nodeId) as Node
    const targetParent = this.graph.getCellById(targetParentId) as Node

    if (!node || !targetParent) return false

    const nodeData = node.getData() as MindMapNodeData
    const targetParentData = targetParent.getData() as MindMapNodeData

    if (!nodeData || !targetParentData) return false
    if (nodeData.level === 'root') return false
    if (nodeId === targetParentId) return false
    if (this.isDescendant(nodeId, targetParentId)) return false

    const oldParentId = nodeData.parentId
    if (oldParentId === targetParentId) return false

    if (oldParentId) {
      const oldParent = this.graph.getCellById(oldParentId) as Node
      if (oldParent) {
        const oldParentData = oldParent.getData() as MindMapNodeData
        if (oldParentData?.children) {
          oldParent.setData({
            ...oldParentData,
            children: oldParentData.children.filter((id) => id !== nodeId),
          })
        }
      }
    }

    const oldEdges = this.graph.getEdges().filter(
      (edge) => edge.getTargetCellId() === nodeId || edge.getSourceCellId() === nodeId
    )
    oldEdges.forEach((edge) => this.graph.removeCell(edge))

    let newLevel: MindMapNodeLevel
    let direction: 'left' | 'right' = nodeData.direction || 'right'

    if (targetParentData.level === 'root') {
      newLevel = 'primary'
      const primaryRight = this.graph.getNodes().filter(
        (n) => n.getData()?.level === 'primary' && n.getData()?.direction === 'right'
      )
      const primaryLeft = this.graph.getNodes().filter(
        (n) => n.getData()?.level === 'primary' && n.getData()?.direction === 'left'
      )
      direction = primaryRight.length <= primaryLeft.length ? 'right' : 'left'
    } else {
      newLevel = 'secondary'
      direction = targetParentData.direction || 'right'
    }

    const newData: MindMapNodeData = {
      ...nodeData,
      level: newLevel,
      parentId: targetParentId,
      direction,
    }
    node.setData(newData)

    if (newLevel === 'primary') {
      node.resize(140, 50)
      node.attr('body/rx', 25)
      node.attr('body/ry', 25)
      node.attr('body/strokeWidth', 2)
      node.attr('body/opacity', 1)
      node.attr('label/fontSize', 16)
      node.attr('label/fontWeight', 'bold')
    } else {
      node.resize(110, 36)
      node.attr('body/rx', 18)
      node.attr('body/ry', 18)
      node.attr('body/strokeWidth', 1.5)
      node.attr('body/opacity', 0.85)
      node.attr('label/fontSize', 14)
      node.attr('label/fontWeight', 'normal')
    }

    if (targetParentData.children) {
      targetParent.setData({
        ...targetParentData,
        children: [...targetParentData.children, nodeId],
      })
    } else {
      targetParent.setData({
        ...targetParentData,
        children: [nodeId],
      })
    }

    this.createEdge(targetParent, node, nodeData.fillColor, direction)

    const updateDescendantsDirection = (parentId: string, dir: 'left' | 'right') => {
      const parent = this.graph.getCellById(parentId) as Node
      if (!parent) return
      const parentData = parent.getData() as MindMapNodeData
      if (!parentData?.children) return

      parentData.children.forEach((childId) => {
        const child = this.graph.getCellById(childId) as Node
        if (child) {
          const childData = child.getData() as MindMapNodeData
          if (childData) {
            child.setData({ ...childData, direction: dir })
            updateDescendantsDirection(childId, dir)
          }
        }
      })
    }
    updateDescendantsDirection(nodeId, direction)

    this.reconnectDescendantEdges(nodeId)

    this.layoutNodes()
    return true
  }

  private reconnectDescendantEdges(parentId: string) {
    const parent = this.graph.getCellById(parentId) as Node
    if (!parent) return
    const parentData = parent.getData() as MindMapNodeData
    if (!parentData?.children) return

    parentData.children.forEach((childId) => {
      const child = this.graph.getCellById(childId) as Node
      if (child) {
        const childData = child.getData() as MindMapNodeData
        const direction = childData?.direction || 'right'
        const color = childData?.fillColor || '#1890ff'

        const existingEdges = this.graph.getEdges().filter(
          (edge) => edge.getSourceCellId() === parentId && edge.getTargetCellId() === childId
        )

        if (existingEdges.length === 0) {
          this.createEdge(parent, child, color, direction)
        } else {
          existingEdges.forEach((edge) => {
            const sourceAnchor = direction === 'right' ? 'right' : 'left'
            const targetAnchor = direction === 'right' ? 'left' : 'right'
            edge.setSource({ cell: parentId, anchor: { name: sourceAnchor } })
            edge.setTarget({ cell: childId, anchor: { name: targetAnchor } })
            edge.attr('line/stroke', color)
          })
        }

        this.reconnectDescendantEdges(childId)
      }
    })
  }

  deleteNode(node: Node) {
    const data = node.getData() as MindMapNodeData
    if (!data) return

    if (data.level === 'root') {
      return
    }

    if (data.parentId) {
      const parentNode = this.graph.getCellById(data.parentId) as Node
      if (parentNode) {
        const parentData = parentNode.getData() as MindMapNodeData
        if (parentData?.children) {
          parentNode.setData({
            ...parentData,
            children: parentData.children.filter((id) => id !== node.id),
          })
        }
      }
    }

    const deleteRecursive = (nodeId: string) => {
      const currentNode = this.graph.getCellById(nodeId) as Node
      if (!currentNode) return

      const currentData = currentNode.getData() as MindMapNodeData
      if (currentData?.children) {
        currentData.children.forEach((childId) => {
          deleteRecursive(childId)
        })
      }

      const edges = this.graph.getEdges()
      edges.forEach((edge) => {
        if (edge.getSourceCellId() === nodeId || edge.getTargetCellId() === nodeId) {
          this.graph.removeCell(edge)
        }
      })

      this.graph.removeCell(currentNode)
    }

    deleteRecursive(node.id)
    this.layoutNodes()
  }

  initializeDefaultMindMap() {
    const root = this.createRootNode('中心主题', 400, 300)

    const topics = ['分支一', '分支二', '分支三']
    topics.forEach((topic, index) => {
      const direction: 'left' | 'right' = index < 1 ? 'left' : 'right'
      const primaryNode = this.createPrimaryNode(topic, root.id, direction)

      for (let i = 0; i < 2; i++) {
        this.createSecondaryNode(`子主题${i + 1}`, primaryNode.id)
      }
    })

    this.layoutNodes()
  }
}
