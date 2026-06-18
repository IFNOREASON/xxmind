import { Graph, Node } from '@antv/x6'
import { TimelineEventData, TimelineAxisData, EVENT_COLORS } from './types'

export class TimelineShapeManager {
  graph: Graph
  timelineAxis: TimelineAxisData
  events: TimelineEventData[] = []

  private readonly TIMELINE_Y = 300
  private readonly MONTH_WIDTH = 60
  private readonly EVENT_HEIGHT = 80
  private readonly EVENT_SPACING = 20

  constructor(graph: Graph) {
    this.graph = graph
    this.timelineAxis = {
      id: 'timeline-axis',
      startYear: 2020,
      endYear: 2030,
      x: 100,
      y: this.TIMELINE_Y,
      width: (2030 - 2020) * 12 * this.MONTH_WIDTH,
    }
  }

  initializeTimeline() {
    this.createTimelineAxis()
    this.createYearMarkers()
    this.addDefaultEvents()
  }

  private createTimelineAxis() {
    const { x, y, width } = this.timelineAxis

    this.graph.addNode({
      id: 'timeline-axis-main',
      shape: 'path',
      d: `M 0 0 L ${width} 0`,
      x: x,
      y: y,
      attrs: {
        body: {
          stroke: '#1890ff',
          strokeWidth: 3,
          fill: 'none',
        },
      },
      zIndex: 2,
    })
  }

  private createYearMarkers() {
    const { x, y, startYear, endYear } = this.timelineAxis

    for (let year = startYear; year <= endYear; year++) {
      const yearX = x + (year - startYear) * 12 * this.MONTH_WIDTH

      this.graph.addNode({
        id: `year-marker-${year}`,
        shape: 'path',
        d: 'M 0 0 L 0 -15',
        x: yearX,
        y: y,
        attrs: {
          body: {
            stroke: '#1890ff',
            strokeWidth: 2,
          },
        },
        zIndex: 3,
      })

      this.graph.addNode({
        id: `year-label-${year}`,
        shape: 'rect',
        x: yearX - 25,
        y: y + 15,
        width: 50,
        height: 20,
        attrs: {
          body: {
            fill: 'none',
            stroke: 'none',
          },
          label: {
            text: `${year}`,
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#333',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
          },
        },
        zIndex: 3,
      })
    }
  }

  private addDefaultEvents() {
    const defaultEvents: Partial<TimelineEventData>[] = [
      {
        year: 2021,
        month: 3,
        title: '项目启动',
        description: '项目正式立项，组建团队',
        color: EVENT_COLORS[0],
      },
      {
        year: 2022,
        month: 6,
        title: 'Beta版发布',
        description: '首个测试版本发布，开始用户测试',
        color: EVENT_COLORS[1],
      },
      {
        year: 2023,
        month: 1,
        title: '正式上线',
        description: '产品正式发布，开始商业化运营',
        color: EVENT_COLORS[2],
      },
      {
        year: 2024,
        month: 9,
        title: '重大升级',
        description: '完成架构重构，性能提升50%',
        color: EVENT_COLORS[3],
      },
    ]

    defaultEvents.forEach((event, index) => {
      setTimeout(() => {
        this.createEventNode(event)
      }, index * 50)
    })
  }

  createEventNode(eventData: Partial<TimelineEventData>): Node {
    const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const year = eventData.year || 2023
    const month = eventData.month || 6
    const title = eventData.title || '新事件'
    const description = eventData.description || ''
    const color = eventData.color || EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]
    const dateStr = `${year}年${month}月`

    const x = this.getDatePosition(year, month)
    const y = this.TIMELINE_Y - this.EVENT_HEIGHT - 30

    const displayDesc = description.length > 20 ? description.substr(0, 20) + '...' : description

    const eventNode = this.graph.addNode({
      id,
      shape: 'rect',
      x: x - 80,
      y: y,
      width: 160,
      height: this.EVENT_HEIGHT,
      attrs: {
        body: {
          fill: color,
          stroke: '#fff',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        label: {
          text: `${title}\n${dateStr}\n${displayDesc}`,
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#fff',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          lineHeight: 18,
        },
      },
      data: {
        id,
        date: dateStr,
        type: 'event',
        year,
        month,
        title,
        description,
        color,
      },
      zIndex: 10,
    })

    this.graph.addNode({
      id: `${id}-line`,
      shape: 'path',
      d: `M 0 0 L 0 ${this.TIMELINE_Y - y - this.EVENT_HEIGHT + 10}`,
      x: x,
      y: y + this.EVENT_HEIGHT - 10,
      attrs: {
        body: {
          stroke: color,
          strokeWidth: 2,
          strokeDasharray: '4,2',
        },
      },
      parent: id,
      zIndex: 9,
    })

    this.graph.addNode({
      id: `${id}-dot`,
      shape: 'circle',
      x: x - 6,
      y: this.TIMELINE_Y - 6,
      width: 12,
      height: 12,
      attrs: {
        body: {
          fill: color,
          stroke: '#fff',
          strokeWidth: 2,
        },
      },
      parent: id,
      zIndex: 11,
    })

    this.events.push({
      id,
      date: dateStr,
      year,
      month,
      title,
      description,
      color,
      x,
      y,
    })

    return eventNode
  }

  updateEventNode(node: Node, updates: Partial<TimelineEventData>) {
    const data = node.getData() as TimelineEventData
    if (!data) return

    const newData = { ...data, ...updates }
    node.setData(newData)

    const title = updates.title !== undefined ? updates.title : data.title
    const description = updates.description !== undefined ? updates.description : data.description
    const color = updates.color !== undefined ? updates.color : data.color
    const year = updates.year !== undefined ? updates.year : data.year
    const month = updates.month !== undefined ? updates.month : data.month

    const dateStr = `${year}年${month}月`
    const displayDesc = description.length > 20 ? description.substr(0, 20) + '...' : description

    node.attr('body/fill', color)
    node.attr('label/text', `${title}\n${dateStr}\n${displayDesc}`)

    const lineNode = this.graph.getCellById(`${node.id}-line`) as Node
    const dotNode = this.graph.getCellById(`${node.id}-dot`) as Node
    if (lineNode) {
      lineNode.attr('body/stroke', color)
    }
    if (dotNode) {
      dotNode.attr('body/fill', color)
    }

    if (updates.year !== undefined || updates.month !== undefined) {
      const newX = this.getDatePosition(year, month)
      const currentX = node.position().x + 80

      if (Math.abs(newX - currentX) > 1) {
        const deltaX = newX - currentX
        node.translate(deltaX, 0)
      }

      newData.year = year
      newData.month = month
      newData.date = dateStr
      node.setData(newData)
    }

    const index = this.events.findIndex(e => e.id === node.id)
    if (index !== -1) {
      this.events[index] = newData
    }
  }

  deleteEventNode(node: Node) {
    const id = node.id
    const children = this.graph.getCells().filter((cell) => {
      return cell.getParentId() === id
    })
    children.forEach((child) => child.remove())
    node.remove()

    this.events = this.events.filter((e) => e.id !== id)
  }

  layoutEvents() {
    const eventNodes = this.graph.getNodes().filter((node) => {
      const data = node.getData() as TimelineEventData
      return data && data.type === 'event'
    })

    const sortedNodes = eventNodes.sort((a, b) => {
      const dataA = a.getData() as TimelineEventData
      const dataB = b.getData() as TimelineEventData
      const dateA = dataA.year * 12 + dataA.month
      const dateB = dataB.year * 12 + dataB.month
      return dateA - dateB
    })

    const rows: Node[][] = []

    sortedNodes.forEach((node) => {
      const nodeX = node.position().x + 80
      const nodeWidth = 160

      let placed = false
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const lastNode = row[row.length - 1]
        const lastX = lastNode.position().x + 80

        if (nodeX - lastX >= nodeWidth + this.EVENT_SPACING) {
          row.push(node)
          const newY = this.TIMELINE_Y - this.EVENT_HEIGHT - 30 - i * (this.EVENT_HEIGHT + 20)
          node.translate(0, newY - node.position().y)
          placed = true
          break
        }
      }

      if (!placed) {
        rows.push([node])
        const rowIndex = rows.length - 1
        const newY = this.TIMELINE_Y - this.EVENT_HEIGHT - 30 - rowIndex * (this.EVENT_HEIGHT + 20)
        node.translate(0, newY - node.position().y)
      }
    })
  }

  getDatePosition(year: number, month: number): number {
    const { x, startYear } = this.timelineAxis
    return x + ((year - startYear) * 12 + (month - 1)) * this.MONTH_WIDTH
  }

  getPositionDate(x: number): { year: number; month: number } {
    const { x: startX, startYear } = this.timelineAxis
    const totalMonths = Math.round((x - startX) / this.MONTH_WIDTH)
    const year = startYear + Math.floor(totalMonths / 12)
    const month = (totalMonths % 12) + 1
    return { year, month: Math.max(1, Math.min(12, month)) }
  }

  updateTimelineRange(startYear: number, endYear: number) {
    if (startYear >= endYear) return

    this.timelineAxis.startYear = startYear
    this.timelineAxis.endYear = endYear
    this.timelineAxis.width = (endYear - startYear) * 12 * this.MONTH_WIDTH

    this.graph.getCells().forEach((cell) => {
      const id = cell.id as string
      if (
        id.startsWith('timeline-axis') ||
        id.startsWith('year-marker') ||
        id.startsWith('year-label')
      ) {
        cell.remove()
      }
    })

    this.createTimelineAxis()
    this.createYearMarkers()

    this.graph.getNodes().forEach((node) => {
      const data = node.getData() as TimelineEventData
      if (data && data.type === 'event') {
        const newX = this.getDatePosition(data.year, data.month)
        const currentX = node.position().x + 80
        node.translate(newX - currentX, 0)
      }
    })
  }
}
