"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import type { Attachment, Conversation, Message } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bot,
  ChevronDown,
  Check,
  CheckCheck,
  ImageIcon,
  Mic,
  MapPin,
  Paperclip,
  PanelRightOpen,
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
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(249,246,239,0.9))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="flex flex-1 items-center justify-center px-6 text-center">
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
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,239,0.94))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
      <header className="border-b border-border/60 bg-background/70 px-5 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative shrink-0 pt-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-base font-semibold text-foreground">
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
                <h3 className="truncate text-xl font-semibold text-foreground">{conversation.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {conversation.assignee ?? "Sem responsável"} • {channelLabels[conversation.channel]} • Cliente desde{" "}
                  {conversation.customerSince ?? "agora"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
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

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground" onClick={onSearchConversation}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={onCloseConversation}>
              Fechar
            </Button>
            <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={onReturnConversation}>
              Retornar
            </Button>
            <Button size="sm" className="rounded-full shadow-sm shadow-primary/20" onClick={onTransferConversation}>
              Transferir
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground" onClick={onToggleInspector}>
              <PanelRightOpen className={`h-4 w-4 transition-transform ${isInspectorOpen ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground" onClick={onOpenShortcuts}>
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto bg-[linear-gradient(180deg,rgba(249,247,242,0.96),rgba(255,255,255,0.98))] px-5 py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
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

      <div className="border-t border-border/60 bg-background/85 px-5 py-4 backdrop-blur">
        <div className="space-y-4">
          <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground" onClick={handleAttachFile}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground" onClick={handleAttachImage}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground" onClick={handleEmojiPicker}>
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => notifyAction("Localização", "Atalho de localização em breve.")}
                  title="Localização"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground" onClick={handleVoiceNote}>
                  <Mic className={`h-4 w-4 ${isRecording ? "text-destructive" : ""}`} />
                </Button>
                <div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                  O time vê tudo em tempo real
                </div>
              </div>

              <div className="relative flex items-center gap-3 rounded-[24px] border border-border/70 bg-background/90 px-3 py-2 shadow-sm">
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
                  className="h-11 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                  onKeyDown={(event) => event.key === "Enter" && !event.shiftKey && handleSend()}
                  aria-label="Mensagem"
                />

                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="h-11 rounded-full bg-emerald-600 px-5 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                  <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
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
          max-w-[72%] rounded-[22px] px-4 py-3.5 shadow-sm
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
