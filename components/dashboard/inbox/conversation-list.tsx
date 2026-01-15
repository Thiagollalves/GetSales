"use client"

import type { Conversation } from "@/app/dashboard/inbox/page"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-gradient-to-tr from-purple-500 to-pink-500",
  telegram: "bg-blue-500",
  email: "bg-gray-500",
  webchat: "bg-primary",
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<Conversation["status"] | "all">("all")
  const [channelFilter, setChannelFilter] = useState<Conversation["channel"] | "all">("all")
  const [unreadOnly, setUnreadOnly] = useState(false)

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const matchesSearch =
        conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === "all" || conversation.status === statusFilter
      const matchesChannel = channelFilter === "all" || conversation.channel === channelFilter
      const matchesUnread = !unreadOnly || conversation.unread
      return matchesSearch && matchesStatus && matchesChannel && matchesUnread
    })
  }, [channelFilter, conversations, searchTerm, statusFilter, unreadOnly])

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Inbox</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-9 h-9 text-sm"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        {showFilters && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-secondary/30 p-3">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="ativo">Em atendimento</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value as typeof channelFilter)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="webchat">Webchat</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={unreadOnly ? "secondary" : "outline"}
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() => setUnreadOnly((prev) => !prev)}
            >
              {unreadOnly ? "Somente não lidas" : "Mostrar não lidas"}
            </Button>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`
              w-full p-4 flex items-start gap-3 text-left border-b border-border transition-colors
              ${selectedId === conv.id ? "bg-primary/5" : "hover:bg-secondary/50"}
            `}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                {conv.avatar}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${channelColors[conv.channel]} border-2 border-card`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-medium text-sm ${conv.unread ? "text-foreground" : "text-muted-foreground"}`}>
                  {conv.name}
                </span>
                <span className="text-xs text-muted-foreground">{conv.time}</span>
              </div>
              <p className={`text-sm truncate mt-0.5 ${conv.unread ? "text-foreground" : "text-muted-foreground"}`}>
                {conv.lastMessage}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-[10px]">
                  {conv.status === "novo"
                    ? "Novo"
                    : conv.status === "ativo"
                      ? "Em atendimento"
                      : "Resolvido"}
                </Badge>
                {conv.assignee && (
                  <Badge variant="secondary" className="text-[10px]">
                    {conv.assignee}
                  </Badge>
                )}
              </div>
              {conv.tags.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {conv.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {conv.unread && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  )
}
