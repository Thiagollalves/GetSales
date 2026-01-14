export interface AutomationNode {
  id: string
  type: "trigger" | "action" | "condition" | "delay"
  data: {
    label: string
    icon: string
  }
  position: { x: number; y: number }
}

export interface Automation {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "draft"
  trigger: string
  runs: number
  lastRun: string
  nodes: AutomationNode[]
}
