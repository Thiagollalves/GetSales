export type FlowSyncStatus = "idle" | "testing" | "publishing" | "success" | "error"
export type FlowNodeType = "start" | "step"
export type FlowInteractionType = "message" | "menu" | "media"
export type FlowConditionKind = "response" | "department" | "user" | "api" | "fallback"
export type FlowMediaType = "image" | "video" | "audio" | "file"

export interface FlowInteractionMessage {
  id: string
  type: "message"
  text: string
  tone?: "plain" | "rich"
}

export interface FlowInteractionMenu {
  id: string
  type: "menu"
  title: string
  options: string[]
}

export interface FlowInteractionMedia {
  id: string
  type: "media"
  mediaType: FlowMediaType
  url: string
  caption?: string
}

export type FlowInteraction = FlowInteractionMessage | FlowInteractionMenu | FlowInteractionMedia

export interface FlowCondition {
  id: string
  label: string
  kind: FlowConditionKind
  targetNodeId?: string
  value?: string
}

export interface FlowNodeConfig {
  [key: string]: string | number | boolean | null | undefined
}

export interface FlowNode {
  id: string
  type: FlowNodeType
  title: string
  position: { x: number; y: number }
  interactions: FlowInteraction[]
  conditions: FlowCondition[]
  config: FlowNodeConfig
}

export interface FlowEdge {
  id: string
  from: string
  to: string
  label?: string
}

export interface FlowSettings {
  greeting: string
  fallback: string
  noResponse: string
  returnMessage: string
}

export interface FlowDefinition {
  version: number
  nodes: FlowNode[]
  edges: FlowEdge[]
  settings: FlowSettings
}

export interface FlowEntry {
  id: number
  name: string
  description: string
  trigger: string
  active: boolean
  conversations: number
  testPhone?: string
  keywords: string[]
  isServiceFlow: boolean
  definition: FlowDefinition
  n8nSyncStatus: FlowSyncStatus
  lastPublishedAt?: string
  lastTestScore?: number
  lastTestStatus?: string
}

export interface FlowCreation {
  name: string
  description: string
  active: boolean
  testPhone?: string
  keywords: string[]
  isServiceFlow: boolean
  trigger?: string
  conversations?: number
  definition?: FlowDefinition
  n8nSyncStatus?: FlowSyncStatus
  lastPublishedAt?: string | null
  lastTestScore?: number | null
  lastTestStatus?: string | null
}

export interface FlowPatch {
  name?: string
  description?: string
  active?: boolean
  testPhone?: string
  keywords?: string[]
  isServiceFlow?: boolean
  trigger?: string
  conversations?: number
  definition?: FlowDefinition
  n8nSyncStatus?: FlowSyncStatus
  lastPublishedAt?: string | null
  lastTestScore?: number | null
  lastTestStatus?: string | null
}

const FLOW_DEFINITION_VERSION = 1
let fallbackIdCounter = 0

function createId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) {
    return `${prefix}-${uuid}`
  }

  fallbackIdCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${fallbackIdCounter.toString(36)}`
}

function cloneJson<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value)) as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function cleanText(value: unknown, fallback = "") {
  return asString(value, fallback).trim()
}

function normalizeKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(/[,;\n]/g)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function normalizePosition(value: unknown, fallbackX: number, fallbackY: number) {
  if (!isRecord(value)) {
    return { x: fallbackX, y: fallbackY }
  }

  return {
    x: asNumber(value.x, fallbackX),
    y: asNumber(value.y, fallbackY),
  }
}

function normalizeInteraction(value: unknown): FlowInteraction {
  if (!isRecord(value)) {
    return {
      id: createId("interaction"),
      type: "message",
      text: "",
      tone: "plain",
    }
  }

  const type = value.type === "menu" || value.type === "media" ? value.type : "message"
  const id = cleanText(value.id, createId("interaction"))

  if (type === "menu") {
    return {
      id,
      type,
      title: cleanText(value.title, "Menu"),
      options: normalizeKeywords(value.options),
    }
  }

  if (type === "media") {
    const mediaType = value.mediaType === "video" || value.mediaType === "audio" || value.mediaType === "file" ? value.mediaType : "image"
    return {
      id,
      type,
      mediaType,
      url: cleanText(value.url, ""),
      caption: value.caption === undefined ? undefined : cleanText(value.caption),
    }
  }

  return {
    id,
    type,
    text: cleanText(value.text ?? value.content, ""),
    tone: value.tone === "rich" ? "rich" : "plain",
  }
}

function normalizeCondition(value: unknown): FlowCondition {
  if (!isRecord(value)) {
    return {
      id: createId("condition"),
      label: "Qualquer resposta",
      kind: "response",
    }
  }

  const kind =
    value.kind === "department" ||
    value.kind === "user" ||
    value.kind === "api" ||
    value.kind === "fallback"
      ? value.kind
      : "response"

  return {
    id: cleanText(value.id, createId("condition")),
    label: cleanText(value.label, "Condição"),
    kind,
    targetNodeId: value.targetNodeId === undefined ? undefined : cleanText(value.targetNodeId),
    value: value.value === undefined ? undefined : cleanText(value.value),
  }
}

function normalizeConfig(value: unknown) {
  if (!isRecord(value)) {
    return {}
  }

  const config: FlowNodeConfig = {}
  for (const [key, raw] of Object.entries(value)) {
    if (
      typeof raw === "string" ||
      typeof raw === "number" ||
      typeof raw === "boolean" ||
      raw === null
    ) {
      config[key] = raw
    }
  }

  return config
}

function normalizeNode(value: unknown, index: number): FlowNode {
  if (!isRecord(value)) {
    return {
      id: createId("node"),
      type: index === 0 ? "start" : "step",
      title: index === 0 ? "Início" : "Nova etapa",
      position: { x: 180 + index * 280, y: 120 + (index % 2) * 140 },
      interactions: [],
      conditions: [],
      config: {},
    }
  }

  const type = value.type === "start" ? "start" : "step"
  const fallbackTitle = index === 0 ? "Início" : "Nova etapa"

  return {
    id: cleanText(value.id, createId("node")),
    type,
    title: cleanText(value.title, fallbackTitle),
    position: normalizePosition(value.position, 180 + index * 280, 120 + (index % 2) * 140),
    interactions: Array.isArray(value.interactions) ? value.interactions.map((item) => normalizeInteraction(item)) : [],
    conditions: Array.isArray(value.conditions) ? value.conditions.map((item) => normalizeCondition(item)) : [],
    config: normalizeConfig(value.config),
  }
}

function normalizeEdge(value: unknown): FlowEdge {
  if (!isRecord(value)) {
    return {
      id: createId("edge"),
      from: "",
      to: "",
    }
  }

  return {
    id: cleanText(value.id, createId("edge")),
    from: cleanText(value.from),
    to: cleanText(value.to),
    label: value.label === undefined ? undefined : cleanText(value.label),
  }
}

function createDefaultSettings(flowName = "Novo Fluxo"): FlowSettings {
  return {
    greeting: `Olá! Bem-vindo(a) ao ${flowName}.`,
    fallback: "Não consegui entender sua resposta. Vou ajustar o atendimento.",
    noResponse: "Se não houver resposta, sigo para o próximo passo.",
    returnMessage: "Você pode retornar quando quiser.",
  }
}

function createMessageInteraction(text: string): FlowInteractionMessage {
  return {
    id: createId("interaction"),
    type: "message",
    text,
    tone: "plain",
  }
}

function createMenuInteraction(title: string, options: string[]): FlowInteractionMenu {
  return {
    id: createId("interaction"),
    type: "menu",
    title,
    options,
  }
}

function createMediaInteraction(mediaType: FlowMediaType, url: string, caption?: string): FlowInteractionMedia {
  return {
    id: createId("interaction"),
    type: "media",
    mediaType,
    url,
    caption,
  }
}

function createConditionDraft(label: string, kind: FlowConditionKind, targetNodeId?: string, value?: string): FlowCondition {
  return {
    id: createId("condition"),
    label,
    kind,
    targetNodeId,
    value,
  }
}

function createStartNode(): FlowNode {
  return {
    id: createId("node"),
    type: "start",
    title: "Início",
    position: { x: 320, y: 120 },
    interactions: [],
    conditions: [],
    config: { role: "start" },
  }
}

function createStepNode(title: string, position: { x: number; y: number }, config: FlowNodeConfig = {}, interactions: FlowInteraction[] = [], conditions: FlowCondition[] = []): FlowNode {
  return {
    id: createId("node"),
    type: "step",
    title,
    position,
    interactions,
    conditions,
    config,
  }
}

function remapDefinitionIds(definition: FlowDefinition) {
  const nodeIdMap = new Map<string, string>()
  const edgeIdMap = new Map<string, string>()

  const nextDefinition = cloneJson(definition)
  nextDefinition.nodes = nextDefinition.nodes.map((node, index) => {
    const nextId = createId(index === 0 ? "start" : "node")
    nodeIdMap.set(node.id, nextId)
    return {
      ...node,
      id: nextId,
      position: {
        x: node.position.x + 48,
        y: node.position.y + 32,
      },
      interactions: node.interactions.map((interaction) => ({
        ...interaction,
        id: createId("interaction"),
      })),
      conditions: node.conditions.map((condition) => ({
        ...condition,
        id: createId("condition"),
        targetNodeId: condition.targetNodeId ? condition.targetNodeId : undefined,
      })),
    }
  })

  nextDefinition.edges = nextDefinition.edges.map((edge) => {
    const nextId = createId("edge")
    edgeIdMap.set(edge.id, nextId)
    return {
      ...edge,
      id: nextId,
      from: nodeIdMap.get(edge.from) ?? edge.from,
      to: nodeIdMap.get(edge.to) ?? edge.to,
    }
  })

  nextDefinition.nodes = nextDefinition.nodes.map((node) => ({
    ...node,
    conditions: node.conditions.map((condition) => ({
      ...condition,
      targetNodeId: condition.targetNodeId ? nodeIdMap.get(condition.targetNodeId) ?? condition.targetNodeId : undefined,
    })),
    config: remapNestedIds(node.config, nodeIdMap, edgeIdMap) as FlowNodeConfig,
  }))

  return nextDefinition
}

function remapNestedIds(value: unknown, nodeIdMap: Map<string, string>, edgeIdMap: Map<string, string>): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => remapNestedIds(item, nodeIdMap, edgeIdMap))
  }

  if (!isRecord(value)) {
    if (typeof value === "string") {
      return nodeIdMap.get(value) ?? edgeIdMap.get(value) ?? value
    }

    return value
  }

  const output: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    output[key] = remapNestedIds(item, nodeIdMap, edgeIdMap)
  }

  return output
}

function normalizeDefinitionStructure(value: unknown, flowName = "Novo Fluxo"): FlowDefinition {
  if (typeof value === "string") {
    try {
      return normalizeDefinitionStructure(JSON.parse(value), flowName)
    } catch {
      return createDefaultFlowDefinition(flowName)
    }
  }

  if (!isRecord(value)) {
    return createDefaultFlowDefinition(flowName)
  }

  const rawNodes = Array.isArray(value.nodes) ? value.nodes : []
  const normalizedNodes = rawNodes.length > 0 ? rawNodes.map((node, index) => normalizeNode(node, index)) : createDefaultFlowDefinition(flowName).nodes
  const normalizedEdges = Array.isArray(value.edges) ? value.edges.map((edge) => normalizeEdge(edge)) : []

  return {
    version: asNumber(value.version, FLOW_DEFINITION_VERSION),
    nodes: normalizedNodes,
    edges: normalizedEdges.filter((edge) => Boolean(edge.from) && Boolean(edge.to)),
    settings: isRecord(value.settings)
      ? {
          greeting: cleanText(value.settings.greeting, createDefaultSettings(flowName).greeting),
          fallback: cleanText(value.settings.fallback, createDefaultSettings(flowName).fallback),
          noResponse: cleanText(value.settings.noResponse, createDefaultSettings(flowName).noResponse),
          returnMessage: cleanText(value.settings.returnMessage, createDefaultSettings(flowName).returnMessage),
        }
      : createDefaultSettings(flowName),
  }
}

export function createDefaultFlowDefinition(flowName = "Novo Fluxo") {
  const start = createStartNode()
  const welcome = createStepNode(
    "Boas-vindas!",
    { x: 250, y: 240 },
    { audience: "lead", tone: "warm" },
    [
      createMessageInteraction(`Olá! Eu sou o ${flowName}.`),
      createMenuInteraction("Menu principal", ["Vendas", "Suporte", "Outro"]),
    ],
    [createConditionDraft("Qualquer resposta", "response")],
  )
  const followUp = createStepNode(
    "Nova etapa",
    { x: 560, y: 240 },
    { audience: "lead", tone: "follow-up" },
    [createMediaInteraction("image", "/placeholder-flow.png", "Imagem de apoio")],
    [],
  )

  welcome.conditions = [
    createConditionDraft("Qualquer resposta", "response", followUp.id),
  ]

  return {
    version: FLOW_DEFINITION_VERSION,
    nodes: [start, welcome, followUp],
    edges: [
      {
        id: createId("edge"),
        from: start.id,
        to: welcome.id,
        label: "início",
      },
      {
        id: createId("edge"),
        from: welcome.id,
        to: followUp.id,
        label: "continua",
      },
    ],
    settings: createDefaultSettings(flowName),
  }
}

export function serializeFlowDefinition(definition: FlowDefinition) {
  return normalizeDefinitionStructure(cloneJson(definition))
}

export function deserializeFlowDefinition(value: unknown, flowName = "Novo Fluxo") {
  return normalizeDefinitionStructure(value, flowName)
}

export function addFlowStage(definition: FlowDefinition, title: string, options?: { position?: { x: number; y: number } }) {
  const nextDefinition = deserializeFlowDefinition(definition)
  const previousNode = nextDefinition.nodes[nextDefinition.nodes.length - 1] ?? nextDefinition.nodes[0]
  const position =
    options?.position ??
    ({
      x: (previousNode?.position.x ?? 180) + 280,
      y: previousNode?.position.y ?? 240,
    } as const)

  const nextNode = createStepNode(title.trim() || "Nova etapa", position)
  nextDefinition.nodes = [...nextDefinition.nodes, nextNode]

  if (previousNode) {
    nextDefinition.edges = [
      ...nextDefinition.edges,
      {
        id: createId("edge"),
        from: previousNode.id,
        to: nextNode.id,
        label: "continua",
      },
    ]
  }

  return nextDefinition
}

export function removeFlowStage(definition: FlowDefinition, nodeId: string) {
  const nextDefinition = deserializeFlowDefinition(definition)
  const removedNodeIndex = nextDefinition.nodes.findIndex((node) => node.id === nodeId)
  if (removedNodeIndex < 0) {
    return nextDefinition
  }

  const removedNode = nextDefinition.nodes[removedNodeIndex]
  const incoming = nextDefinition.edges.filter((edge) => edge.to === removedNode.id)
  const outgoing = nextDefinition.edges.filter((edge) => edge.from === removedNode.id)
  const predecessor = incoming[0]?.from
  const successor = outgoing[0]?.to

  nextDefinition.nodes = nextDefinition.nodes.filter((node) => node.id !== removedNode.id)
  nextDefinition.edges = nextDefinition.edges.filter((edge) => edge.from !== removedNode.id && edge.to !== removedNode.id)

  if (predecessor && successor && predecessor !== successor) {
    const alreadyConnected = nextDefinition.edges.some((edge) => edge.from === predecessor && edge.to === successor)
    if (!alreadyConnected) {
      nextDefinition.edges.push({
        id: createId("edge"),
        from: predecessor,
        to: successor,
        label: "reconectar",
      })
    }
  }

  nextDefinition.nodes = nextDefinition.nodes.map((node) => ({
    ...node,
    conditions: node.conditions.filter((condition) => condition.targetNodeId !== removedNode.id),
  }))

  return nextDefinition
}

export function addFlowInteraction(
  definition: FlowDefinition,
  nodeId: string,
  interaction:
    | { type: "message"; text: string; tone?: "plain" | "rich" }
    | { type: "menu"; title: string; options: string[] }
    | { type: "media"; mediaType: FlowMediaType; url: string; caption?: string },
) {
  const nextDefinition = deserializeFlowDefinition(definition)
  const node = nextDefinition.nodes.find((item) => item.id === nodeId)
  if (!node) {
    return nextDefinition
  }

  if (interaction.type === "message") {
    node.interactions.push({
      id: createId("interaction"),
      type: "message",
      text: interaction.text.trim(),
      tone: interaction.tone ?? "plain",
    })
    return nextDefinition
  }

  if (interaction.type === "menu") {
    node.interactions.push({
      id: createId("interaction"),
      type: "menu",
      title: interaction.title.trim(),
      options: interaction.options.map((option) => option.trim()).filter(Boolean),
    })
    return nextDefinition
  }

  node.interactions.push({
    id: createId("interaction"),
    type: "media",
    mediaType: interaction.mediaType,
    url: interaction.url.trim(),
    caption: interaction.caption?.trim() || undefined,
  })

  return nextDefinition
}

export function addFlowCondition(
  definition: FlowDefinition,
  nodeId: string,
  condition: { label: string; kind: FlowConditionKind; targetNodeId?: string; value?: string },
) {
  const nextDefinition = deserializeFlowDefinition(definition)
  const node = nextDefinition.nodes.find((item) => item.id === nodeId)
  if (!node) {
    return nextDefinition
  }

  node.conditions.push({
    id: createId("condition"),
    label: condition.label.trim(),
    kind: condition.kind,
    targetNodeId: condition.targetNodeId?.trim() || undefined,
    value: condition.value?.trim() || undefined,
  })

  return nextDefinition
}

export function connectFlowStages(definition: FlowDefinition, fromNodeId: string, toNodeId: string, label?: string) {
  const nextDefinition = deserializeFlowDefinition(definition)
  const sourceExists = nextDefinition.nodes.some((node) => node.id === fromNodeId)
  const targetExists = nextDefinition.nodes.some((node) => node.id === toNodeId)
  if (!sourceExists || !targetExists) {
    return nextDefinition
  }

  const nextEdge = {
    id: createId("edge"),
    from: fromNodeId,
    to: toNodeId,
    label: label?.trim() || undefined,
  }

  nextDefinition.edges = [
    ...nextDefinition.edges.filter((edge) => !(edge.from === fromNodeId && edge.to === toNodeId)),
    nextEdge,
  ]

  return nextDefinition
}

export function duplicateFlowDefinition(definition: FlowDefinition) {
  return remapDefinitionIds(deserializeFlowDefinition(definition))
}

export function buildFlowTestOutcome(id: number) {
  const normalizedId = Math.abs(Math.trunc(id))
  const score = 60 + ((normalizedId * 13) % 40)
  const status = score >= 85 ? "Excelente" : score >= 70 ? "Satisfatório" : "Precisa melhorar"

  return {
    score,
    status,
  }
}
