"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import type { Attachment, Conversation, Message } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bot,
  ChevronLeft,
  ChevronDown,
  Check,
  CheckCheck,
  ImageIcon,
  Mic,
  MapPin,
  Paperclip,
  PanelRightOpen,
  MoreHorizontal,
  Search,
  Send,
  Smile,
  Zap,
  User,
} from "lucide-react"
import { notifyAction } from "@/lib/button-actions"
import {
  getConversationPriority,
  getConversationStatusLabel,
  getPriorityLabel,
  getPriorityTone,
} from "@/lib/inbox"

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "E-mail",
  webchat: "Chat do site",
}

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-gradient-to-tr from-purple-500 to-pink-500",
  telegram: "bg-blue-500",
  email: "bg-gray-500",
  webchat: "bg-primary",
}

interface ChatWindowProps {
  conversation: Conversation | null
  onBackToList?: () => void
  onToggleInspector: () => void
  onSendMessage?: (payload: { text?: string; attachment?: Attachment }) => void
  onCloseConversation?: () => void
  onReturnConversation?: () => void
  onTransferConversation?: () => void
  onCreateConversation?: () => void
  onSearchConversation?: () => void
  onOpenShortcuts?: () => void
  isInspectorOpen: boolean
}

export function ChatWindow({
  conversation,
  onBackToList,
  onToggleInspector,
  onSendMessage,
  onCloseConversation,
  onReturnConversation,
  onTransferConversation,
  onCreateConversation,
  onSearchConversation,
  onOpenShortcuts,
  isInspectorOpen,
}: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recorderChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages])

  useEffect(() => {
    setMessage("")
    setShowEmojiPicker(false)
    setIsRecording(false)
  }, [conversation?.id])

  const handleSend = () => {
    if (!message.trim()) return
    if (onSendMessage && conversation) {
      onSendMessage({ text: message })
    }
    setMessage("")
  }

  const handleSendAttachment = (attachment: Attachment, fallbackText?: string) => {
    if (onSendMessage && conversation) {
      onSendMessage({ text: fallbackText, attachment })
    }
  }

  const handleAttachFile = () => {
    fileInputRef.current?.click()
  }

  const handleAttachImage = () => {
    mediaInputRef.current?.click()
  }

  const handleEmojiPicker = () => {
    setShowEmojiPicker((previous) => !previous)
  }

  const handleVoiceNote = async () => {
    if (isRecording) {
      recorderRef.current?.stop()
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      notifyAction("Áudio indisponível", "Seu navegador não suporta gravação de áudio.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorderChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recorderChunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        const audioBlob = new Blob(recorderChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        handleSendAttachment({ type: "audio", url, name: "audio.webm" }, "Áudio enviado")
        stream.getTracks().forEach((track) => track.stop())
        recorderRef.current = null
        recorderChunksRef.current = []
        setIsRecording(false)
      }
      recorder.start()
      setIsRecording(true)
    } catch {
      notifyAction("Permissão negada", "Não foi possível acessar o microfone.")
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, type: "file" | "image" | "video") => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    handleSendAttachment({ type, url, name: file.name }, `Arquivo enviado: ${file.name}`)
    event.target.value = ""
  }

  const emojiList = ["😀", "😁", "😂", "😍", "😎", "🤔", "👍", "🙏", "🎉", "🔥", "✅", "💬"]
  const insertEmoji = (emoji: string) => {
    setMessage((previous) => `${previous}${emoji}`)
    setShowEmojiPicker(false)
  }

  if (!conversation) {
    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(249,246,239,0.9))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur sm:rounded-[28px]">
        <div className="flex flex-1 items-center justify-center px-4 py-8 text-center sm:px-6">
          <div className="max-w-md space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Workspace da conversa
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Selecione uma conversa para atender</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              A fila da esquerda mostra os atendimentos disponíveis. Quando você escolher um contato, a conversa,
              as notas internas e o contexto aparecem aqui.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {onCreateConversation ? (
                <Button className="rounded-full" onClick={onCreateConversation}>
                  Nova conversa
                </Button>
              ) : null}
              <Button variant="outline" className="rounded-full bg-transparent" onClick={onSearchConversation}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const priority = getConversationPriority(conversation)

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,239,0.94))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur sm:rounded-[28px]">
      <header className="border-b border-border/60 bg-background/70 px-2 py-1.5 backdrop-blur sm:px-5 sm:py-4">
        <div className="mb-1.5 flex items-center gap-2 xl:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
            onClick={onBackToList}
            aria-label="Voltar para a fila"
            title="Voltar para a fila"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="relative shrink-0 pt-0.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-secondary text-[11px] font-semibold text-foreground">
              {conversation.avatar}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${channelColors[conversation.channel]} border-2 border-background`}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="truncate text-sm font-semibold text-foreground">{conversation.name}</h3>
            <p className="truncate text-[11px] text-muted-foreground">
              {conversation.assignee ?? "Sem responsável"} • {channelLabels[conversation.channel]}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
                  aria-label="Ações da conversa"
                  title="Ações da conversa"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border/60">
                <DropdownMenuItem onSelect={() => onToggleInspector()}>
                  {isInspectorOpen ? "Fechar inspector" : "Abrir inspector"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onCloseConversation?.()}>Fechar atendimento</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onReturnConversation?.()}>Retornar para ativos</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onTransferConversation?.()}>Transferir atendimento</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSearchConversation?.()}>Buscar na conversa</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden flex-col gap-3 xl:flex xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative shrink-0 pt-0.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-foreground sm:h-12 sm:w-12 sm:text-base">
                {conversation.avatar}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ${channelColors[conversation.channel]} border-2 border-background`}
              />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  Conversa ativa
                </p>
                <h3 className="truncate text-lg font-semibold text-foreground sm:text-xl">{conversation.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {conversation.assignee ?? "Sem responsável"} • {channelLabels[conversation.channel]} • Cliente desde{" "}
                  {conversation.customerSince ?? "agora"}
                </p>
              </div>

              <div className="hidden flex-wrap gap-2 sm:flex">
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {getConversationStatusLabel(conversation)}
                </Badge>
                <Badge variant={getPriorityTone(priority)} className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {getPriorityLabel(priority)}
                </Badge>
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  Score {conversation.score}
                </Badge>
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {channelLabels[conversation.channel]}
                </Badge>
              </div>
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-2 xl:flex xl:justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-muted-foreground"
              onClick={onSearchConversation}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-10 rounded-full bg-transparent px-3 text-xs sm:px-4 sm:text-sm" onClick={onCloseConversation}>
              <span className="sm:hidden">Fechar</span>
              <span className="hidden sm:inline">Fechar</span>
            </Button>
            <Button variant="outline" size="sm" className="h-10 rounded-full bg-transparent px-3 text-xs sm:px-4 sm:text-sm" onClick={onReturnConversation}>
              <span className="sm:hidden">Retornar</span>
              <span className="hidden sm:inline">Retornar</span>
            </Button>
            <Button size="sm" className="h-10 rounded-full px-3 text-xs shadow-sm shadow-primary/20 sm:px-4 sm:text-sm" onClick={onTransferConversation}>
              <span className="sm:hidden">Transferir</span>
              <span className="hidden sm:inline">Transferir</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-10 w-10 rounded-full text-muted-foreground xl:inline-flex"
              onClick={onToggleInspector}
            >
              <PanelRightOpen className={`h-4 w-4 transition-transform ${isInspectorOpen ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground" onClick={onOpenShortcuts}>
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto bg-[linear-gradient(180deg,rgba(249,247,242,0.96),rgba(255,255,255,0.98))] px-2 py-3 sm:px-5 sm:py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:gap-4">
          {conversation.messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFirst={index === 0}
              contactName={conversation.name}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/85 px-2 py-2 backdrop-blur sm:px-5 sm:py-4">
        <div className="space-y-2 sm:space-y-4">
          <section className="rounded-[20px] border border-border/60 bg-background/80 p-2 shadow-sm sm:rounded-[24px] sm:p-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleAttachFile}
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleAttachImage}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleEmojiPicker}
                >
                  <Smile className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => notifyAction("Localização", "Atalho de localização em breve.")}
                  title="Localização"
                >
                  <MapPin className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleVoiceNote}
                >
                  <Mic className={`h-3.5 w-3.5 ${isRecording ? "text-destructive" : ""}`} />
                </Button>
                <div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                  O time vê tudo em tempo real
                </div>
              </div>

              <div className="relative flex flex-row items-end gap-2 rounded-[20px] border border-border/70 bg-background/90 px-2 py-2 shadow-sm sm:gap-3 sm:px-3 sm:py-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => handleFileChange(event, "file")}
                />
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    const attachmentType = file.type.startsWith("video") ? "video" : "image"
                    handleFileChange(event, attachmentType)
                  }}
                />

                <Input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="h-11 min-w-0 flex-1 border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0"
                  onKeyDown={(event) => event.key === "Enter" && !event.shiftKey && handleSend()}
                  aria-label="Mensagem"
                />

                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="h-11 shrink-0 rounded-full bg-emerald-600 px-4 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 sm:px-5"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                  <ChevronDown className="ml-2 hidden h-4 w-4 opacity-70 sm:inline-flex" />
                </Button>
              </div>

              {showEmojiPicker ? (
                <div className="rounded-[22px] border border-border/60 bg-background/95 p-3 shadow-lg">
                  <div className="grid grid-cols-6 gap-2">
                    {emojiList.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="h-9 w-9 rounded-xl text-lg transition-colors hover:bg-secondary"
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function MessageBubble({
  message,
  isFirst,
  contactName,
}: {
  message: Message
  isFirst: boolean
  contactName: string
}) {
  const isContact = message.sender === "contact"
  const isBot = message.sender === "bot"

  return (
    <div
      className={`flex ${isContact ? "justify-start" : "justify-end"} animate-fade-in`}
      style={{ animationDelay: isFirst ? "0ms" : "50ms" }}
    >
      <div
        className={`
          max-w-[88%] rounded-[20px] px-3.5 py-3 shadow-sm sm:max-w-[72%] sm:rounded-[22px] sm:px-4 sm:py-3.5
          ${
            isContact
              ? "border border-slate-200/80 bg-slate-50/95 text-slate-900 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.35)]"
              : "bg-emerald-700 text-emerald-50 shadow-[0_14px_30px_-18px_rgba(5,150,105,0.45)]"
          }
          ${isBot ? "border border-amber-300/70 bg-amber-50 text-slate-900 shadow-[0_10px_24px_-20px_rgba(120,53,15,0.22)]" : ""}
        `}
      >
        {!isContact ? (
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-current/70">
            {isBot ? (
              <>
                <Bot className="h-3.5 w-3.5" />
                Assistente IA
              </>
            ) : (
              <>
                <User className="h-3.5 w-3.5" />
                Você
              </>
            )}
          </div>
        ) : null}

        {message.attachment ? (
          <div className="mb-2">
            {message.attachment.type === "image" ? (
              <img
                src={message.attachment.url}
                alt={message.attachment.name}
                className="max-w-full rounded-2xl border border-border/50"
              />
            ) : null}
            {message.attachment.type === "video" ? (
              <video src={message.attachment.url} controls className="max-w-full rounded-2xl border border-border/50" />
            ) : null}
            {message.attachment.type === "audio" ? <audio src={message.attachment.url} controls className="w-full" /> : null}
            {message.attachment.type === "file" ? (
              <a href={message.attachment.url} download={message.attachment.name} className="text-sm text-primary underline">
                {message.attachment.name}
              </a>
            ) : null}
          </div>
          ) : null}

        {message.content ? <p className="break-words text-[15px] leading-7 tracking-[-0.01em]">{message.content}</p> : null}

        <div className={`mt-2.5 flex items-center gap-1.5 ${isContact ? "justify-start" : "justify-end"}`}>
          <span className={`text-[11px] font-medium ${isContact ? "text-slate-500" : "text-emerald-50/85"}`}>
            {message.time}
          </span>
          {!isContact && message.status ? (
            <span className="text-emerald-50/85">
              {message.status === "read" ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          ) : null}
          {isContact ? (
            <span className="text-[11px] text-muted-foreground/80">{contactName}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
