"use client"

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AtSign,
  BellOff,
  BellRing,
  CornerDownRight,
  ChevronLeft,
  ImageIcon,
  MoreHorizontal,
  Paperclip,
  PanelRightOpen,
  Pin,
  PinOff,
  Reply,
  Send,
  Smile,
  Users,
} from "lucide-react"
import type { InternalAttachment, InternalConversation, InternalMessage, TeamMember } from "@/lib/internal-chat"
import {
  getConversationTypeLabel,
  getPresenceLabel,
  getTeamMember,
} from "@/lib/internal-chat"

interface InternalChatWindowProps {
  conversation: InternalConversation | null
  members: TeamMember[]
  currentUserId: number
  onBackToList?: () => void
  onToggleInspector: () => void
  onSendMessage: (payload: { text: string; replyToId?: number; attachment?: InternalAttachment; mentionIds?: number[] }) => void
  onTogglePinConversation: () => void
  onToggleMuteConversation: () => void
  onOpenLeadContext?: () => void
  onPinMessage: (messageId: number) => void
  onReactToMessage: (messageId: number, emoji: string) => void
  isInspectorOpen: boolean
}

const emojiOptions = ["😀", "😁", "😂", "😍", "😎", "🤔", "👍", "🙏", "🎉", "🔥", "✅", "💬"]

const presenceTone: Record<string, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  busy: "bg-rose-500",
  offline: "bg-muted-foreground",
}

function getMessageAuthor(memberId: number, members: TeamMember[]) {
  return getTeamMember(memberId) ?? members.find((member) => member.id === memberId)
}

function formatReplySnippet(message: InternalMessage, members: TeamMember[]) {
  const author = getMessageAuthor(message.authorId, members)
  return `${author?.name ?? "Usuário"} • ${message.content.slice(0, 64)}`
}

function getReplyCount(messageId: number, messages: InternalMessage[]) {
  return messages.filter((message) => message.replyToId === messageId).length
}

export function InternalChatWindow({
  conversation,
  members,
  currentUserId,
  onBackToList,
  onToggleInspector,
  onSendMessage,
  onTogglePinConversation,
  onToggleMuteConversation,
  onOpenLeadContext,
  onPinMessage,
  onReactToMessage,
  isInspectorOpen,
}: InternalChatWindowProps) {
  const [message, setMessage] = useState("")
  const [replyTarget, setReplyTarget] = useState<InternalMessage | null>(null)
  const [pendingAttachment, setPendingAttachment] = useState<InternalAttachment | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [mentionIds, setMentionIds] = useState<number[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages])

  useEffect(() => {
    setMessage("")
    setReplyTarget(null)
    setPendingAttachment(null)
    setMentionIds([])
    setShowEmojiPicker(false)
  }, [conversation?.id])

  if (!conversation) {
    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,239,0.94))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur sm:rounded-[30px]">
        <div className="flex flex-1 items-center justify-center px-4 py-8 text-center">
          <div className="max-w-md space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Chat interno
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Escolha uma conversa da equipe</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              A lista da esquerda concentra dms, grupos, canais e menções. Quando você escolher uma conversa, o workspace
              e o inspector aparecem aqui.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button className="rounded-full" onClick={onBackToList}>
                Ver conversas
              </Button>
              {onOpenLeadContext ? (
                <Button variant="outline" className="rounded-full bg-transparent" onClick={onOpenLeadContext}>
                  Abrir contexto
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const author = getTeamMember(currentUserId)
  const participantNames = conversation.memberIds
    .map((memberId) => getTeamMember(memberId)?.name)
    .filter(Boolean)
    .slice(0, 4)

  const handleSend = () => {
    const text = message.trim()
    if (!text && !pendingAttachment) return

    onSendMessage({
      text,
      replyToId: replyTarget?.id,
      attachment: pendingAttachment ?? undefined,
      mentionIds: mentionIds.length > 0 ? mentionIds : undefined,
    })

    setMessage("")
    setReplyTarget(null)
    setPendingAttachment(null)
    setMentionIds([])
    setShowEmojiPicker(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return
    event.preventDefault()
    handleSend()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPendingAttachment({
      id: Date.now(),
      type: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("audio/")
            ? "audio"
            : "file",
      name: file.name,
      url,
      sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    })
    event.target.value = ""
  }

  const insertEmoji = (emoji: string) => {
    setMessage((previous) => `${previous}${emoji}`)
    setShowEmojiPicker(false)
  }

  const insertMention = (member: TeamMember) => {
    setMessage((previous) => `${previous}@${member.name} `)
    setMentionIds((previous) => Array.from(new Set([...previous, member.id])))
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,245,239,0.95))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur sm:rounded-[30px]">
      <header className="border-b border-border/60 bg-background/80 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {onBackToList ? (
              <Button
                variant="outline"
                size="icon"
                className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-background"
                onClick={onBackToList}
                aria-label="Voltar para a lista"
                title="Voltar para a lista"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-foreground">
              {conversation.avatar}
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ${presenceTone[getTeamMember(conversation.memberIds[0])?.presence ?? "online"]} border-2 border-background`}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Chat interno</p>
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] font-medium">
                  {getConversationTypeLabel(conversation.type)}
                </Badge>
                {conversation.relatedLeadName ? (
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[10px] font-medium">
                    Lead: {conversation.relatedLeadName}
                  </Badge>
                ) : null}
              </div>
              <h2 className="truncate text-lg font-semibold text-foreground">{conversation.name}</h2>
              <p className="truncate text-sm text-muted-foreground">
                {participantNames.join(" • ") || conversation.description || "Conversa da equipe"}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {conversation.typingMemberIds?.length ? (
                  <span>{conversation.typingMemberIds.map((memberId) => getTeamMember(memberId)?.name).filter(Boolean).join(", ")} digitando...</span>
                ) : (
                  <span>{conversation.lastMessageAt}</span>
                )}
                {conversation.muted ? <Badge variant="secondary" className="rounded-full px-2 py-1 text-[10px]">Silenciado</Badge> : null}
                {conversation.pinned ? <Badge variant="secondary" className="rounded-full px-2 py-1 text-[10px]">Fixado</Badge> : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenLeadContext && conversation.relatedLeadId ? (
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={onOpenLeadContext}>
                <Users className="h-4 w-4" />
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={onTogglePinConversation}>
              {conversation.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={onToggleMuteConversation}>
              {conversation.muted ? <BellRing className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={onToggleInspector}>
              <PanelRightOpen className={`h-4 w-4 transition-transform ${isInspectorOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-4">
        <div className="space-y-3">
          {conversation.messages.map((item) => {
            const isSelf = item.authorId === currentUserId
            const author = getTeamMember(item.authorId)
            const replyTo = item.replyToId ? conversation.messages.find((message) => message.id === item.replyToId) : null
            const replyAuthor = replyTo ? getTeamMember(replyTo.authorId) : null
            const replyCount = getReplyCount(item.id, conversation.messages)

            return (
              <div key={item.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                <div className={`group max-w-[min(38rem,86%)] rounded-[22px] border px-4 py-3 shadow-sm ${isSelf ? "border-emerald-600/20 bg-emerald-600 text-white" : "border-border/60 bg-background/95 text-foreground"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2.5 w-2.5 rounded-full ${presenceTone[author?.presence ?? "online"]}`} />
                          <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${isSelf ? "text-emerald-50/80" : "text-muted-foreground"}`}>
                            {isSelf ? "Você" : author?.name ?? "Equipe"}
                          </p>
                        </div>
                        {item.pinned ? (
                          <Badge variant="secondary" className={`rounded-full px-2 py-0.5 text-[10px] ${isSelf ? "bg-white/15 text-white" : ""}`}>
                            Fixado
                          </Badge>
                        ) : null}
                      </div>
                      {replyTo ? (
                        <div className={`mt-2 rounded-[18px] border px-3 py-2 text-xs ${isSelf ? "border-white/20 bg-white/10 text-white/80" : "border-border/60 bg-muted/35 text-muted-foreground"}`}>
                          <div className="flex items-center gap-1.5 font-medium">
                            <CornerDownRight className="h-3.5 w-3.5" />
                            <span className="truncate">{replyAuthor?.name ?? "Mensagem"}</span>
                          </div>
                          <p className="mt-1 line-clamp-2">{replyTo.content}</p>
                        </div>
                      ) : null}
                      <p className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${isSelf ? "text-white" : "text-foreground"}`}>{item.content}</p>
                      {item.attachments?.length ? (
                        <div className="mt-3 space-y-2">
                          {item.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className={`flex items-center gap-3 rounded-[18px] border px-3 py-2 ${isSelf ? "border-white/20 bg-white/10 text-white" : "border-border/60 bg-muted/30 text-foreground"}`}
                            >
                              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isSelf ? "bg-white/15" : "bg-background"}`}>
                                <ImageIcon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{attachment.name}</p>
                                <p className={`text-xs ${isSelf ? "text-white/70" : "text-muted-foreground"}`}>{attachment.sizeLabel ?? attachment.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {item.reactions?.length ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.reactions.map((reaction) => (
                            <Badge
                              key={reaction.emoji}
                              variant="secondary"
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isSelf ? "bg-white/15 text-white" : ""}`}
                            >
                              {reaction.emoji} {reaction.userIds.length}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      <div className={`mt-3 flex items-center justify-between text-[11px] ${isSelf ? "text-white/70" : "text-muted-foreground"}`}>
                        <span>{item.time}</span>
                        {replyCount > 0 ? <span>{replyCount} resposta(s)</span> : null}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${isSelf ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground"}`}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl border-border/60">
                        <DropdownMenuItem onSelect={() => setReplyTarget(item)}>
                          <Reply className="mr-2 h-4 w-4" />
                          Responder
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onPinMessage(item.id)}>
                          <Pin className="mr-2 h-4 w-4" />
                          {item.pinned ? "Desafixar" : "Fixar"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {["👍", "❤️", "😂", "🔥"].map((emoji) => (
                          <DropdownMenuItem key={emoji} onSelect={() => onReactToMessage(item.id, emoji)}>
                            {emoji} Reagir
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/80 px-3 py-3 backdrop-blur sm:px-4">
        {replyTarget ? (
          <div className="mb-2 flex items-start justify-between gap-3 rounded-[18px] border border-border/60 bg-muted/25 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Respondendo</p>
              <p className="truncate text-sm text-foreground">{formatReplySnippet(replyTarget, members)}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs" onClick={() => setReplyTarget(null)}>
              Limpar
            </Button>
          </div>
        ) : null}

        {pendingAttachment ? (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-[18px] border border-border/60 bg-muted/25 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{pendingAttachment.name}</p>
                <p className="text-xs text-muted-foreground">{pendingAttachment.sizeLabel ?? pendingAttachment.type}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs" onClick={() => setPendingAttachment(null)}>
              Remover
            </Button>
          </div>
        ) : null}

        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1">
          <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground">
                <Smile className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="grid w-56 grid-cols-6 gap-1 rounded-2xl border-border/60 p-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-xl px-2 py-2 text-lg transition-colors hover:bg-muted"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground">
                <AtSign className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl border-border/60">
              {members
                .filter((member) => member.id !== currentUserId)
                .map((member) => (
                  <DropdownMenuItem key={member.id} onSelect={() => insertMention(member)}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-[10px] font-semibold mr-2">
                      {member.avatar}
                    </div>
                    {member.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={onToggleInspector}>
            <PanelRightOpen className="h-4 w-4" />
          </Button>

          <div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className={`h-2.5 w-2.5 rounded-full ${presenceTone[author?.presence ?? "online"]}`} />
            <span>{author ? `Você está como ${getPresenceLabel(author.presence)}` : "Online"}</span>
          </div>
        </div>

        <div className="flex items-end gap-3 rounded-[24px] border border-border/60 bg-background/90 p-3 shadow-sm">
          <div className="min-w-0 flex-1">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem interna..."
              className="min-h-20 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
            {mentionIds.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {mentionIds.map((memberId) => {
                  const member = getTeamMember(memberId)
                  return member ? (
                    <Badge key={member.id} variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-medium">
                      @{member.name}
                    </Badge>
                  ) : null
                })}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full bg-transparent"
              onClick={handleSend}
              disabled={!message.trim() && !pendingAttachment}
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
    </section>
  )
}
