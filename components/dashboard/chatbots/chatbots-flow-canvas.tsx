"use client"

import type { PointerEvent, ReactNode } from "react"
import { useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import type { FlowDefinition, FlowNode } from "@/lib/chatbots-core"
import { cn } from "@/lib/utils"
import { Bot, Move, Plus, Sparkles } from "lucide-react"

const NODE_WIDTH = 212
const NODE_HEIGHT = 108
const CANVAS_PADDING = 160

interface ChatbotsFlowCanvasProps {
  definition: FlowDefinition
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onMoveNode: (nodeId: string, position: { x: number; y: number }) => void
  onAddStage: () => void
}

interface DragState {
  kind: "pan" | "node"
  startX: number
  startY: number
  scrollLeft: number
  scrollTop: number
  nodeId?: string
  nodeX?: number
  nodeY?: number
}

function getNodeCenter(node: FlowNode) {
  return {
    x: node.position.x + NODE_WIDTH / 2,
    y: node.position.y + NODE_HEIGHT / 2,
  }
}

function buildPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const controlOffset = Math.max(120, Math.abs(to.x - from.x) * 0.35)
  const midX = from.x + (to.x >= from.x ? controlOffset : -controlOffset)

  return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${to.x - controlOffset} ${to.y}, ${to.x} ${to.y}`
}

function NodeIcon({ type }: { type: FlowNode["type"] }) {
  return type === "start" ? (
    <PlayIcon />
  ) : (
    <Sparkles className="h-4 w-4 text-emerald-700" />
  )
}

function PlayIcon() {
  return <Bot className="h-4 w-4 text-emerald-700" />
}

export function ChatbotsFlowCanvas({
  definition,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
  onAddStage,
}: ChatbotsFlowCanvasProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const dragState = useRef<DragState | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const { width, height } = useMemo(() => {
    const maxX = Math.max(...definition.nodes.map((node) => node.position.x), 0)
    const maxY = Math.max(...definition.nodes.map((node) => node.position.y), 0)
    return {
      width: Math.max(1400, maxX + NODE_WIDTH + CANVAS_PADDING),
      height: Math.max(820, maxY + NODE_HEIGHT + CANVAS_PADDING),
    }
  }, [definition.nodes])

  const nodeMap = useMemo(() => {
    return new Map(definition.nodes.map((node) => [node.id, node]))
  }, [definition.nodes])

  const handleCanvasPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    const target = event.target as HTMLElement
    if (target.closest("[data-flow-node]")) {
      return
    }

    const container = scrollRef.current
    if (!container) {
      return
    }

    setIsPanning(true)
    dragState.current = {
      kind: "pan",
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    }
    container.setPointerCapture(event.pointerId)
  }

  const handleNodePointerDown = (event: PointerEvent<HTMLButtonElement>, node: FlowNode) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const container = scrollRef.current
    if (!container) {
      return
    }

    setDraggingNodeId(node.id)
    onSelectNode(node.id)
    dragState.current = {
      kind: "node",
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
      nodeId: node.id,
      nodeX: node.position.x,
      nodeY: node.position.y,
    }
    container.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current
    if (!drag) {
      return
    }

    if (drag.kind === "pan") {
      const container = scrollRef.current
      if (!container) {
        return
      }

      container.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX)
      container.scrollTop = drag.scrollTop - (event.clientY - drag.startY)
      return
    }

    if (!drag.nodeId || drag.nodeX === undefined || drag.nodeY === undefined) {
      return
    }

    const nextX = Math.max(32, drag.nodeX + (event.clientX - drag.startX))
    const nextY = Math.max(32, drag.nodeY + (event.clientY - drag.startY))
    onMoveNode(drag.nodeId, { x: nextX, y: nextY })
  }

  const handlePointerUp = () => {
    dragState.current = null
    setIsPanning(false)
    setDraggingNodeId(null)
  }

  return (
    <div className="relative min-h-0 h-full overflow-hidden bg-[#faf8f1]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <div className="rounded-full border border-emerald-200 bg-white/85 px-3 py-1.5 text-[11px] font-medium text-emerald-700 shadow-sm backdrop-blur">
          Arraste para mover o canvas
        </div>
      </div>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <ButtonPill onClick={onAddStage} icon={<Plus className="h-4 w-4" />} label="Nova Etapa" />
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "h-full min-h-0 overflow-auto overscroll-contain px-4 py-4",
          isPanning ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="relative"
          style={{
            width,
            height,
          }}
        >
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <marker
                id="chatbot-flow-arrow"
                markerWidth="12"
                markerHeight="12"
                refX="10"
                refY="6"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,12 L12,6 z" fill="#7aa37f" />
              </marker>
            </defs>

            {definition.edges.map((edge) => {
              const fromNode = nodeMap.get(edge.from)
              const toNode = nodeMap.get(edge.to)
              if (!fromNode || !toNode) {
                return null
              }

              const from = getNodeCenter(fromNode)
              const to = getNodeCenter(toNode)

              return (
                <path
                  key={edge.id}
                  d={buildPath(from, to)}
                  fill="none"
                  stroke="#9fb3a2"
                  strokeWidth="2.2"
                  markerEnd="url(#chatbot-flow-arrow)"
                  strokeLinecap="round"
                />
              )
            })}
          </svg>

          {definition.nodes.map((node) => {
            const isSelected = node.id === selectedNodeId
            const interactionsCount = node.interactions.length
            const conditionsCount = node.conditions.length

            return (
              <button
                key={node.id}
                type="button"
                data-flow-node
                onPointerDown={(event) => handleNodePointerDown(event, node)}
                onClick={() => onSelectNode(node.id)}
                className={cn(
                  "absolute w-[212px] rounded-[24px] border bg-white/95 text-left shadow-[0_18px_40px_rgba(12,18,25,0.08)] transition-transform",
                  node.type === "start" ? "border-emerald-200 bg-emerald-50/90" : "border-border/60",
                  isSelected ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-transparent" : "",
                  draggingNodeId === node.id ? "scale-[1.01] shadow-[0_22px_50px_rgba(12,18,25,0.12)]" : "",
                )}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  height: NODE_HEIGHT,
                }}
              >
                <div
                  className={cn(
                    "flex h-10 items-center justify-between rounded-t-[24px] px-4",
                    node.type === "start" ? "bg-emerald-100/90 text-emerald-800" : "bg-emerald-600 text-white",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <NodeIcon type={node.type} />
                    <span className="text-sm font-semibold">{node.title}</span>
                  </div>
                  <Move className="h-4 w-4 opacity-60" />
                </div>

                <div className="flex h-[calc(100%-2.5rem)] flex-col justify-between px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      {interactionsCount} interação{interactionsCount === 1 ? "" : "ões"}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-fuchsia-200 bg-fuchsia-50 px-2.5 py-0.5 text-[11px] font-medium text-fuchsia-700">
                      {conditionsCount} condição{conditionsCount === 1 ? "" : "ões"}
                    </Badge>
                  </div>

                  <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {node.config.tone === "follow-up"
                      ? "Etapa seguinte para conduzir a conversa."
                      : node.type === "start"
                        ? "Ponto inicial do fluxo."
                        : "Card de etapa com interações, condições e configurações."}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ButtonPill({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
    >
      {icon}
      {label}
    </button>
  )
}
