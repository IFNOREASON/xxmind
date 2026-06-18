import { Graph, Node } from '@antv/x6'
import { FishboneStyle, FishboneNodeData } from './types'

export interface FishboneLayoutConfig {
  style: FishboneStyle
  spineStartX: number
  spineEndX: number
  spineY: number
  categoryGap: number
  causeGap: number
  nodeWidth: number
  nodeHeight: number
}

const CATEGORY_COLORS = [
  '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#fd79a8', '#a29bfe', '#74b9ff', '#ff7675',
]

export class FishboneShapeManager {
  private graph: Graph
  private config: FishboneLayoutConfig

  constructor(graph: Graph, style: FishboneStyle = 'classic') {
    this.graph = graph
    this.config = {
      style,
      spineStartX: 100,
      spineEndX: 700,
      spineY: 300,
      categoryGap: 90,
      causeGap: 50,
      nodeWidth: 100,
      nodeHeight: 36,
    }
  }

  setStyle(style: FishboneStyle) {
    this.config.style = style
  }

  getStyle(): FishboneStyle {
    return this.config.style
  }

  private createPathNode(pathData: string, color: string, strokeWidth: number = 2, zIndex: number = 1): Node {
    return this.graph.addNode({
      shape: 'path',
      path: pathData,
      attrs: {
        body: {
          stroke: color,
          strokeWidth,
          fill: 'none',
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        },
      },
      zIndex,
      draggable: false,
      data: { level: 'bone' },
    })
  }

  createSpine(): Node {
    const { spineStartX, spineEndX, spineY, style } = this.config
    let spinePath = ''

    switch (style) {
      case 'classic':
        spinePath = `M ${spineStartX} ${spineY} L ${spineEndX} ${spineY}`
        break
      case 'right-angle':
        spinePath = `M ${spineStartX} ${spineY} L ${spineEndX} ${spineY}`
        break
      case 'rounded':
        spinePath = `M ${spineStartX} ${spineY} L ${spineEndX} ${spineY}`
        break
      case 'modern':
        spinePath = `M ${spineStartX} ${spineY} L ${spineEndX} ${spineY}`
        break
      default:
        spinePath = `M ${spineStartX} ${spineY} L ${spineEndX} ${spineY}`
    }

    const spine = this.graph.addNode({
      id: 'spine',
      shape: 'path',
      x: 0,
      y: 0,
      path: spinePath,
      attrs: {
        body: {
          stroke: style === 'modern' ? '#2c3e50' : '#333',
          strokeWidth: style === 'modern' ? 4 : 3,
          fill: 'none',
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        },
      },
      zIndex: 0,
      data: { level: 'spine' },
      draggable: false,
    })

    const fishHeadX = spineEndX + 20
    const fishHeadPath = `
      M ${fishHeadX} ${spineY - 35}
      Q ${fishHeadX + 50} ${spineY - 35} ${fishHeadX + 70} ${spineY}
      Q ${fishHeadX + 50} ${spineY + 35} ${fishHeadX} ${spineY + 35}
      L ${spineEndX} ${spineY}
      Z
    `

    this.graph.addNode({
      id: 'fish-head',
      shape: 'path',
      x: 0,
      y: 0,
      path: fishHeadPath,
      attrs: {
        body: {
          fill: '#ff6b6b',
          stroke: '#ee5a5a',
          strokeWidth: 2,
        },
      },
      zIndex: 1,
      data: { level: 'bone', type: 'fish-head' },
      draggable: false,
    })

    const fishTailX = spineStartX - 30
    const fishTailPath = `
      M ${spineStartX} ${spineY}
      L ${fishTailX} ${spineY - 25}
      M ${spineStartX} ${spineY}
      L ${fishTailX} ${spineY + 25}
    `

    this.graph.addNode({
      id: 'fish-tail',
      shape: 'path',
      x: 0,
      y: 0,
      path: fishTailPath,
      attrs: {
        body: {
          stroke: style === 'modern' ? '#2c3e50' : '#333',
          strokeWidth: 3,
          fill: 'none',
          strokeLinecap: 'round' as const,
        },
      },
      zIndex: 1,
      data: { level: 'bone', type: 'fish-tail' },
      draggable: false,
    })

    return spine
  }

  createProblemNode(label: string): Node {
    const { spineEndX, spineY } = this.config
    const problemX = spineEndX + 100
    const problemY = spineY - 25

    const problemNode = this.graph.addNode({
      id: 'problem',
      shape: 'rect',
      x: problemX,
      y: problemY,
      width: 120,
      height: 50,
      label: label,
      attrs: {
        body: {
          fill: '#ff6b6b',
          stroke: '#ee5a5a',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        label: {
          fill: '#fff',
          fontWeight: 'bold',
          fontSize: 14,
        },
      },
      data: { level: 'problem', children: [] },
      zIndex: 10,
    })

    return problemNode
  }

  createCategoryNode(
    label: string,
    index: number,
    total: number,
    color: string
  ): { node: Node; bonePath: Node } {
    const { spineStartX, spineEndX, spineY, categoryGap, style } = this.config
    
    const availableWidth = spineEndX - spineStartX - 100
    const categoriesPerSide = Math.ceil(total / 2)
    const side = index % 2 === 0 ? 'top' : 'bottom'
    const sideIndex = Math.floor(index / 2)
    
    const spacing = availableWidth / (categoriesPerSide + 1)
    const x = spineStartX + 50 + spacing * (sideIndex + 1)
    const direction = side === 'top' ? -1 : 1
    
    const categoryY = spineY + direction * (categoryGap + sideIndex * 15)
    const nodeWidth = Math.max(80, label.length * 12 + 20)
    const nodeX = x + 30

    let bonePathData = ''
    switch (style) {
      case 'classic':
        bonePathData = `M ${x} ${spineY} L ${x + 40} ${categoryY}`
        break
      case 'right-angle':
        bonePathData = `M ${x} ${spineY} L ${x} ${categoryY} L ${x + 30} ${categoryY}`
        break
      case 'rounded':
        const midY = (spineY + categoryY) / 2
        bonePathData = `M ${x} ${spineY} Q ${x} ${midY} ${x + 25} ${midY} L ${x + 40} ${categoryY}`
        break
      case 'modern':
        bonePathData = `M ${x} ${spineY} C ${x + 20} ${spineY + direction * 20} ${x + 30} ${categoryY} ${x + 40} ${categoryY}`
        break
      default:
        bonePathData = `M ${x} ${spineY} L ${x + 40} ${categoryY}`
    }

    const boneNode = this.graph.addNode({
      id: `category-bone-${index}`,
      shape: 'path',
      x: 0,
      y: 0,
      path: bonePathData,
      attrs: {
        body: {
          stroke: style === 'modern' ? '#34495e' : color,
          strokeWidth: style === 'modern' ? 3 : 2,
          fill: 'none',
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        },
      },
      zIndex: 1,
      data: { level: 'bone', type: 'category', parentId: 'spine' },
      draggable: false,
    })

    const categoryNode = this.graph.addNode({
      id: `category-${index}`,
      shape: 'rect',
      x: nodeX,
      y: categoryY - 18,
      width: nodeWidth,
      height: 36,
      label: label,
      attrs: {
        body: {
          fill: color,
          stroke: color,
          strokeWidth: 1.5,
          rx: style === 'rounded' || style === 'modern' ? 8 : style === 'right-angle' ? 0 : 4,
          ry: style === 'rounded' || style === 'modern' ? 8 : style === 'right-angle' ? 0 : 4,
        },
        label: {
          fill: style === 'modern' ? '#fff' : '#333',
          fontWeight: 'bold',
          fontSize: 12,
        },
      },
      data: { level: 'category', color, parentId: 'problem', children: [], boneX: x, boneY: categoryY, direction },
      zIndex: 10,
    })

    return { node: categoryNode, bonePath: boneNode }
  }

  createCauseNode(
    label: string,
    categoryId: string,
    categoryIndex: number,
    causeIndex: number,
    totalCauses: number,
    color: string
  ): { node: Node; bonePath: Node } {
    const { causeGap, style } = this.config
    
    const categoryNode = this.graph.getNodes().find(n => n.id === categoryId)
    if (!categoryNode) {
      throw new Error(`Category node ${categoryId} not found`)
    }

    const catData = categoryNode.getData() as FishboneNodeData
    const catPos = categoryNode.position()
    const catSize = categoryNode.size()
    const catCenter = {
      x: catPos.x + catSize.width,
      y: catPos.y + catSize.height / 2,
    }
    
    const direction = catData.direction || (catPos.y < this.config.spineY ? -1 : 1)
    
    const causesSpacing = 55
    const causeX = catCenter.x + 40 + causeIndex * causesSpacing
    const baseOffset = (totalCauses - 1) * causeGap / 2
    const causeY = catCenter.y + direction * (baseOffset - causeIndex * causeGap)
    
    const nodeWidth = Math.max(70, label.length * 11 + 16)

    let bonePathData = ''
    switch (style) {
      case 'classic':
        bonePathData = `M ${catCenter.x} ${catCenter.y} L ${causeX - 10} ${causeY}`
        break
      case 'right-angle':
        const midX = (catCenter.x + causeX) / 2
        bonePathData = `M ${catCenter.x} ${catCenter.y} L ${midX} ${catCenter.y} L ${midX} ${causeY} L ${causeX - 10} ${causeY}`
        break
      case 'rounded':
        const cpX = (catCenter.x + causeX) / 2
        bonePathData = `M ${catCenter.x} ${catCenter.y} Q ${cpX} ${catCenter.y} ${cpX} ${(catCenter.y + causeY) / 2} T ${causeX - 10} ${causeY}`
        break
      case 'modern':
        bonePathData = `M ${catCenter.x} ${catCenter.y} C ${catCenter.x + 15} ${catCenter.y + direction * 10} ${causeX - 20} ${causeY} ${causeX - 10} ${causeY}`
        break
      default:
        bonePathData = `M ${catCenter.x} ${catCenter.y} L ${causeX - 10} ${causeY}`
    }

    const boneNode = this.graph.addNode({
      id: `cause-bone-${categoryId}-${causeIndex}`,
      shape: 'path',
      x: 0,
      y: 0,
      path: bonePathData,
      attrs: {
        body: {
          stroke: style === 'modern' ? '#7f8c8d' : color,
          strokeWidth: style === 'modern' ? 2 : 1.5,
          fill: 'none',
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        },
      },
      zIndex: 1,
      data: { level: 'bone', type: 'cause', parentId: categoryId },
      draggable: false,
    })

    const causeNode = this.graph.addNode({
      id: `cause-${categoryId}-${causeIndex}-${Date.now()}`,
      shape: 'rect',
      x: causeX,
      y: causeY - 14,
      width: nodeWidth,
      height: 28,
      label: label,
      attrs: {
        body: {
          fill: style === 'modern' ? '#ecf0f1' : '#ffffff',
          stroke: color,
          strokeWidth: 1.5,
          rx: style === 'rounded' || style === 'modern' ? 6 : style === 'right-angle' ? 0 : 4,
          ry: style === 'rounded' || style === 'modern' ? 6 : style === 'right-angle' ? 0 : 4,
        },
        label: {
          fill: style === 'modern' ? '#2c3e50' : '#333',
          fontSize: 11,
        },
      },
      data: { level: 'cause', color, parentId: categoryId, children: [], direction, categoryIndex, causeIndex },
      zIndex: 10,
    })

    return { node: causeNode, bonePath: boneNode }
  }

  createSubcauseNode(
    label: string,
    causeId: string,
    categoryIndex: number,
    subcauseIndex: number,
    color: string
  ): { node: Node; bonePath: Node } {
    const causeNode = this.graph.getNodes().find(n => n.id === causeId)
    if (!causeNode) {
      throw new Error(`Cause node ${causeId} not found`)
    }

    const causeData = causeNode.getData() as FishboneNodeData
    const causePos = causeNode.position()
    const causeSize = causeNode.size()
    const causeCenter = {
      x: causePos.x + causeSize.width,
      y: causePos.y + causeSize.height / 2,
    }
    
    const direction = causeData.direction || (causePos.y < this.config.spineY ? -1 : 1)
    const subcauseX = causeCenter.x + 50 + subcauseIndex * 45
    const subcauseY = causeCenter.y + direction * (subcauseIndex * 30 + 20)
    
    const nodeWidth = Math.max(60, label.length * 10 + 12)

    const bonePathData = `M ${causeCenter.x} ${causeCenter.y} L ${subcauseX - 10} ${subcauseY}`

    const boneNode = this.graph.addNode({
      id: `subcause-bone-${causeId}-${subcauseIndex}`,
      shape: 'path',
      x: 0,
      y: 0,
      path: bonePathData,
      attrs: {
        body: {
          stroke: color,
          strokeWidth: 1,
          fill: 'none',
          strokeLinecap: 'round' as const,
        },
      },
      zIndex: 1,
      data: { level: 'bone', type: 'subcause', parentId: causeId },
      draggable: false,
    })

    const subcauseNode = this.graph.addNode({
      id: `subcause-${causeId}-${subcauseIndex}-${Date.now()}`,
      shape: 'rect',
      x: subcauseX,
      y: subcauseY - 12,
      width: nodeWidth,
      height: 24,
      label: label,
      attrs: {
        body: {
          fill: '#fafafa',
          stroke: color,
          strokeWidth: 1,
          rx: 3,
          ry: 3,
        },
        label: {
          fill: '#555',
          fontSize: 10,
        },
      },
      data: { level: 'subcause', color, parentId: causeId, direction, categoryIndex },
      zIndex: 10,
    })

    return { node: subcauseNode, bonePath: boneNode }
  }

  updateAllBones() {
    const nodes = this.graph.getNodes()
    const boneNodes = nodes.filter(n => {
      const data = n.getData()
      return data?.level === 'bone' && data?.type !== 'fish-head' && data?.type !== 'fish-tail'
    })
    
    boneNodes.forEach(bone => {
      this.graph.removeNode(bone)
    })

    const categoryNodes = nodes.filter(n => n.getData()?.level === 'category')
    const causeNodes = nodes.filter(n => n.getData()?.level === 'cause')
    const subcauseNodes = nodes.filter(n => n.getData()?.level === 'subcause')

    categoryNodes.forEach((catNode, index) => {
      const data = catNode.getData() as FishboneNodeData
      const catPos = catNode.position()
      const catSize = catNode.size()
      const direction = catPos.y < this.config.spineY ? -1 : 1
      
      let bonePathData = ''
      const x = catPos.x - 40
      const categoryY = catPos.y + catSize.height / 2
      
      switch (this.config.style) {
        case 'classic':
          bonePathData = `M ${x} ${this.config.spineY} L ${catPos.x - 10} ${categoryY}`
          break
        case 'right-angle':
          bonePathData = `M ${x} ${this.config.spineY} L ${x} ${categoryY} L ${catPos.x - 10} ${categoryY}`
          break
        case 'rounded':
          const midY = (this.config.spineY + categoryY) / 2
          bonePathData = `M ${x} ${this.config.spineY} Q ${x} ${midY} ${x + 15} ${midY} L ${catPos.x - 10} ${categoryY}`
          break
        case 'modern':
          bonePathData = `M ${x} ${this.config.spineY} C ${x + 20} ${this.config.spineY + direction * 20} ${catPos.x - 20} ${categoryY} ${catPos.x - 10} ${categoryY}`
          break
      }

      this.createPathNode(bonePathData, data.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length], this.config.style === 'modern' ? 3 : 2)
    })

    causeNodes.forEach((causeNode, index) => {
      const data = causeNode.getData() as FishboneNodeData
      const causePos = causeNode.position()
      const causeSize = causeNode.size()
      
      const parentNode = this.graph.getNodes().find(n => n.id === data.parentId)
      if (!parentNode) return
      
      const parentPos = parentNode.position()
      const parentSize = parentNode.size()
      const parentCenter = {
        x: parentPos.x + parentSize.width,
        y: parentPos.y + parentSize.height / 2,
      }
      
      const direction = causePos.y < this.config.spineY ? -1 : 1
      let bonePathData = ''
      
      switch (this.config.style) {
        case 'classic':
          bonePathData = `M ${parentCenter.x} ${parentCenter.y} L ${causePos.x - 10} ${causePos.y + causeSize.height / 2}`
          break
        case 'right-angle':
          const midX = (parentCenter.x + causePos.x) / 2
          bonePathData = `M ${parentCenter.x} ${parentCenter.y} L ${midX} ${parentCenter.y} L ${midX} ${causePos.y + causeSize.height / 2} L ${causePos.x - 10} ${causePos.y + causeSize.height / 2}`
          break
        case 'rounded':
          const cpX = (parentCenter.x + causePos.x) / 2
          bonePathData = `M ${parentCenter.x} ${parentCenter.y} Q ${cpX} ${parentCenter.y} ${cpX} ${(parentCenter.y + causePos.y + causeSize.height / 2) / 2} T ${causePos.x - 10} ${causePos.y + causeSize.height / 2}`
          break
        case 'modern':
          bonePathData = `M ${parentCenter.x} ${parentCenter.y} C ${parentCenter.x + 15} ${parentCenter.y + direction * 10} ${causePos.x - 20} ${causePos.y + causeSize.height / 2} ${causePos.x - 10} ${causePos.y + causeSize.height / 2}`
          break
      }

      this.createPathNode(bonePathData, data.color || CATEGORY_COLORS[0], this.config.style === 'modern' ? 2 : 1.5)
    })

    subcauseNodes.forEach((subcauseNode, index) => {
      const data = subcauseNode.getData() as FishboneNodeData
      const subcausePos = subcauseNode.position()
      const subcauseSize = subcauseNode.size()
      
      const parentNode = this.graph.getNodes().find(n => n.id === data.parentId)
      if (!parentNode) return
      
      const parentPos = parentNode.position()
      const parentSize = parentNode.size()
      const parentCenter = {
        x: parentPos.x + parentSize.width,
        y: parentPos.y + parentSize.height / 2,
      }
      
      const bonePathData = `M ${parentCenter.x} ${parentCenter.y} L ${subcausePos.x - 10} ${subcausePos.y + subcauseSize.height / 2}`
      this.createPathNode(bonePathData, data.color || CATEGORY_COLORS[0], 1)
    })
  }

  redrawWithNewStyle(style: FishboneStyle) {
    this.setStyle(style)
    
    const nodes = this.graph.getNodes()
    const oldData: FishboneNodeData[] = []
    
    nodes.forEach(node => {
      const data = node.getData()
      if (data && data.level !== 'bone' && data.level !== 'spine') {
        oldData.push({
          id: node.id,
          label: node.attr('label/text') as string || '',
          level: data.level,
          color: data.color,
          x: node.position().x,
          y: node.position().y,
          parentId: data.parentId,
        })
      }
    })

    this.graph.clearCells()
    this.createSpine()

    const problemData = oldData.find(d => d.level === 'problem')
    if (problemData) {
      this.createProblemNode(problemData.label)
    }

    const categoryData = oldData.filter(d => d.level === 'category')

    categoryData.forEach((cat, index) => {
      this.createCategoryNode(
        cat.label,
        index,
        categoryData.length,
        cat.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      )
    })

    const causeData = oldData.filter(d => d.level === 'cause')
    causeData.forEach((cause, index) => {
      const catIndex = categoryData.findIndex(c => c.id === cause.parentId)
      if (catIndex >= 0) {
        const causesInCategory = causeData.filter(c => c.parentId === cause.parentId)
        const causeIndexInCategory = causesInCategory.findIndex(c => c.id === cause.id)
        
        this.createCauseNode(
          cause.label,
          cause.parentId || '',
          catIndex,
          causeIndexInCategory,
          causesInCategory.length,
          cause.color
        )
      }
    })

    const subcauseData = oldData.filter(d => d.level === 'subcause')
    subcauseData.forEach((subcause, index) => {
      const causeIndex = causeData.findIndex(c => c.id === subcause.parentId)
      if (causeIndex >= 0) {
        const catIndex = categoryData.findIndex(c => c.id === causeData[causeIndex].parentId)
        
        this.createSubcauseNode(
          subcause.label,
          subcause.parentId || '',
          catIndex,
          index,
          subcause.color
        )
      }
    })
  }

  layoutNodes() {
    const nodes = this.graph.getNodes()
    const categoryNodes = nodes.filter(n => n.getData()?.level === 'category')
    const causeNodes = nodes.filter(n => n.getData()?.level === 'cause')
    const problemNode = nodes.find(n => n.getData()?.level === 'problem')
    
    const { spineStartX, spineEndX, spineY, categoryGap } = this.config
    
    if (problemNode) {
      problemNode.position(spineEndX + 100, spineY - 25)
    }
    
    const totalCategories = categoryNodes.length
    const categoriesPerSide = Math.ceil(totalCategories / 2)
    const availableWidth = spineEndX - spineStartX - 100
    const spacing = availableWidth / (categoriesPerSide + 1)
    
    const topCategories = categoryNodes.filter((_, i) => i % 2 === 0)
    const bottomCategories = categoryNodes.filter((_, i) => i % 2 === 1)
    
    topCategories.forEach((cat, index) => {
      const x = spineStartX + 50 + spacing * (index + 1)
      const categoryY = spineY - categoryGap - index * 15
      
      cat.position(x + 30, categoryY - 18)
      const data = cat.getData() as FishboneNodeData
      cat.setData({ ...data, direction: -1, boneX: x, boneY: categoryY })
    })
    
    bottomCategories.forEach((cat, index) => {
      const x = spineStartX + 50 + spacing * (index + 1)
      const categoryY = spineY + categoryGap + index * 15
      
      cat.position(x + 30, categoryY - 18)
      const data = cat.getData() as FishboneNodeData
      cat.setData({ ...data, direction: 1, boneX: x, boneY: categoryY })
    })
    
    categoryNodes.forEach((catNode, catIdx) => {
      const catPos = catNode.position()
      const catSize = catNode.size()
      const catCenter = {
        x: catPos.x + catSize.width,
        y: catPos.y + catSize.height / 2,
      }
      
      const causesInCategory = causeNodes.filter(n => n.getData()?.parentId === catNode.id)
      const catData = catNode.getData() as FishboneNodeData
      const direction = catData.direction || (catPos.y < spineY ? -1 : 1)
      
      causesInCategory.forEach((causeNode, causeIdx) => {
        const causesSpacing = 55
        const causeX = catCenter.x + 40 + causeIdx * causesSpacing
        const baseOffset = (causesInCategory.length - 1) * 50 / 2
        const causeY = catCenter.y + direction * (baseOffset - causeIdx * 50)
        
        causeNode.position(causeX, causeY - 14)
        const causeData = causeNode.getData() as FishboneNodeData
        causeNode.setData({ ...causeData, direction, causeIndex: causeIdx })
      })
    })
    
    this.updateAllBones()
  }
}
