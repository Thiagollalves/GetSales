import type { Conversation } from "@/lib/mock-data"

export type LiveBoardGroupBy = "assignee" | "department"
export type LiveBoardView = "grid" | "list"

export type LiveBoardSearchParams =
  | URLSearchParams
  | {
      get(name: string): string | null
    }
  | Record<string, string | string[] | undefined>

export interface LiveBoardState {
  groupBy: LiveBoardGroupBy
  view: LiveBoardView
  q: string
}

export interface LiveBoardGroupByOption {
  value: LiveBoardGroupBy
  label: string
}

export interface LiveBoardViewOption {
  value: LiveBoardView
  label: string
}

export interface LiveBoardLane {
  id: string
  label: string
  tone: LiveBoardLaneTone
  count: number
  items: Conversation[]
}

export interface LiveBoardModel {
  onlineCount: number
  visibleCount: number
  lanes: LiveBoardLane[]
}

export type LiveBoardLaneTone = "amber" | "emerald" | "sky" | "violet" | "rose" | "teal" | "slate"

export const liveBoardGroupByOptions: LiveBoardGroupByOption[] = [
  { value: "assignee", label: "Atendentes" },
  { value: "department", label: "Departamentos" },
]

export const liveBoardViewOptions: LiveBoardViewOption[] = [
  { value: "grid", label: "Grade" },
  { value: "list", label: "Lista" },
]

const liveBoardLanePalette: LiveBoardLaneTone[] = ["emerald", "sky", "violet", "rose", "teal", "slate"]

function getSearchParamValue(searchParams: LiveBoardSearchParams, key: string) {
  if ("get" in searchParams && typeof searchParams.get === "function") {
    return searchParams.get(key)
  }

  const value = (searchParams as Record<string, string | string[] | undefined>)[key]
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function normalizeGroupBy(candidate: string | null): LiveBoardGroupBy {
  return candidate === "department" ? "department" : "assignee"
}

function normalizeView(candidate: string | null): LiveBoardView {
  return candidate === "list" ? "list" : "grid"
}

function normalizeSearchQuery(candidate: string | null) {
  return candidate?.trim() ?? ""
}

function matchesLiveBoardSearch(conversation: Conversation, query: string) {
  if (!query) {
    return true
  }

  const haystack = [
    conversation.name,
    conversation.lastMessage,
    conversation.assignee ?? "",
    conversation.department ?? "",
    conversation.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

function getLiveBoardGroupLabel(conversation: Conversation, groupBy: LiveBoardGroupBy) {
  if (groupBy === "department") {
    return conversation.department?.trim() || "Sem departamento"
  }

  return conversation.assignee?.trim() || "Sem responsável"
}

function sortLiveBoardConversations(a: Conversation, b: Conversation) {
  const priorityWeight = { high: 0, medium: 1, low: 2 } as const
  const aPriority = priorityWeight[a.priority ?? (a.score >= 80 ? "high" : a.score >= 50 ? "medium" : "low")]
  const bPriority = priorityWeight[b.priority ?? (b.score >= 80 ? "high" : b.score >= 50 ? "medium" : "low")]

  if (aPriority !== bPriority) {
    return aPriority - bPriority
  }

  if (a.unread !== b.unread) {
    return a.unread ? -1 : 1
  }

  if (a.score !== b.score) {
    return b.score - a.score
  }

  return a.name.localeCompare(b.name)
}

function getLaneTone(index: number): LiveBoardLaneTone {
  return liveBoardLanePalette[index % liveBoardLanePalette.length]
}

function getSearchParamSource(pathnameOrSearchParams: string | LiveBoardSearchParams, searchParams?: LiveBoardSearchParams) {
  return typeof pathnameOrSearchParams === "string" ? searchParams : pathnameOrSearchParams
}

export function resolveLiveBoardState(searchParams: LiveBoardSearchParams): LiveBoardState
export function resolveLiveBoardState(pathname: string, searchParams: LiveBoardSearchParams): LiveBoardState
export function resolveLiveBoardState(
  pathnameOrSearchParams: string | LiveBoardSearchParams,
  searchParams?: LiveBoardSearchParams,
): LiveBoardState {
  const resolvedSearchParams = getSearchParamSource(pathnameOrSearchParams, searchParams)
  if (!resolvedSearchParams) {
    return {
      groupBy: "assignee",
      view: "grid",
      q: "",
    }
  }

  return {
    groupBy: normalizeGroupBy(getSearchParamValue(resolvedSearchParams, "groupBy")),
    view: normalizeView(getSearchParamValue(resolvedSearchParams, "view")),
    q: normalizeSearchQuery(getSearchParamValue(resolvedSearchParams, "q")),
  }
}

export function buildLiveBoardUrl(pathname: string, state: LiveBoardState) {
  const params = new URLSearchParams()

  params.set("groupBy", state.groupBy)
  params.set("view", state.view)

  if (state.q.trim()) {
    params.set("q", state.q.trim())
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function getSeededLivePresenceCount(conversations: Conversation[]) {
  const activeCount = conversations.filter((conversation) => conversation.status === "ativo").length
  const pendingCount = conversations.filter((conversation) => conversation.status === "novo").length

  return activeCount * 8 + pendingCount * 2
}

export function buildLiveBoardModel(conversations: Conversation[], state: LiveBoardState): LiveBoardModel {
  const query = state.q.trim().toLowerCase()
  const eligibleConversations = conversations.filter((conversation) => conversation.status !== "resolvido")
  const activeConversations = eligibleConversations.filter((conversation) => conversation.status === "ativo")

  const pendingItems = eligibleConversations
    .filter((conversation) => conversation.status === "novo")
    .filter((conversation) => matchesLiveBoardSearch(conversation, query))
    .sort(sortLiveBoardConversations)

  const activeItems = activeConversations
    .filter((conversation) => conversation.status === "ativo")
    .filter((conversation) => matchesLiveBoardSearch(conversation, query))
    .sort(sortLiveBoardConversations)

  const baseLaneLabels = Array.from(
    new Map(
      activeConversations.map((conversation) => {
        const label = getLiveBoardGroupLabel(conversation, state.groupBy)
        return [label, label] as const
      }),
    ).values(),
  ).sort((a, b) => a.localeCompare(b))

  const lanes: LiveBoardLane[] = [
    {
      id: "pendentes",
      label: "Pendentes",
      tone: "amber",
      count: pendingItems.length,
      items: pendingItems,
    },
    ...baseLaneLabels.map((label, index) => {
      const items = activeItems
        .filter((conversation) => getLiveBoardGroupLabel(conversation, state.groupBy) === label)
        .sort(sortLiveBoardConversations)

      return {
        id: label,
        label,
        tone: getLaneTone(index),
        count: items.length,
        items,
      }
    }),
  ]

  return {
    onlineCount: getSeededLivePresenceCount(eligibleConversations),
    visibleCount: pendingItems.length + activeItems.length,
    lanes,
  }
}
