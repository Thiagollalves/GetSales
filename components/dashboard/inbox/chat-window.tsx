"use client"

import type { Conversation, Message, Attachment } from "@/app/dashboard/inbox/page"
import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  Paperclip,
  Smile,
  User,
  MoreVertical,
  Bot,
  Check,
  CheckCheck,
  ImageIcon,
  Mic,
  Phone,
  Video,
} from "lucide-react"
import { notifyAction } from "@/lib/button-actions"

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
  conversation: Conversation
  onToggleProfile: () => void
  onSendMessage?: (payload: { text?: string; attachment?: Attachment }) => void
}

export function ChatWindow({ conversation, onToggleProfile, onSendMessage }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recorderChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation.messages])

  const handleSend = () => {
    if (!message.trim()) return
    if (onSendMessage) {
      onSendMessage({ text: message })
    }
    setMessage("")
  }

  const handleSendAttachment = (attachment: Attachment, fallbackText?: string) => {
    if (onSendMessage) {
      onSendMessage({ text: fallbackText, attachment })
    }
  }

  const handleStartCall = () => {
    notifyAction("Chamada de voz", `Iniciando chamada com ${conversation.name}.`)
  }

  const handleStartVideo = () => {
    notifyAction("Chamada de vídeo", `Iniciando vídeo com ${conversation.name}.`)
  }

  const handleMoreOptions = () => {
    notifyAction("Mais opções", "Abrindo opções adicionais da conversa.")
  }

  const handleAttachFile = () => {
    fileInputRef.current?.click()
  }

  const handleAttachImage = () => {
    mediaInputRef.current?.click()
  }

  const handleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev)
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
    } catch (error) {
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
  const quickReplies = [
    "Olá! Como posso ajudar?",
    "Já estamos verificando para você.",
    "Pode me confirmar seus dados?",
    "Obrigado pelo contato! 😊",
  ]

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => `${prev}${emoji}`)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const handleQuickReply = (reply: string) => {
    setMessage((prev) => (prev.trim() ? `${prev} ${reply}` : reply))
    inputRef.current?.focus()
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="h-16 border-b border-border px-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center text-sm font-semibold text-primary">
              {conversation.avatar}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${channelColors[conversation.channel]} border-2 border-card`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{conversation.name}</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">{channelLabels[conversation.channel]} • Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleStartCall}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleStartVideo}
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleProfile}
            className="text-muted-foreground hover:text-foreground"
          >
            <User className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleMoreOptions}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/20">
        {conversation.messages.map((msg, index) => (
          <MessageBubble key={msg.id} message={msg} isFirst={index === 0} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="relative flex items-center gap-2 p-2 rounded-xl bg-secondary/50 border border-border/50">
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
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-primary"
            onClick={handleAttachFile}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-primary"
            onClick={handleAttachImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-2"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-primary"
            onClick={handleEmojiPicker}
          >
            <Smile className="h-4 w-4" />
          </Button>
          <div className="hidden lg:flex items-center gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                className="text-xs px-2 py-1 rounded-full bg-card border border-border/50 hover:bg-secondary"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-14 right-16 w-56 rounded-xl border border-border bg-card shadow-lg p-2 grid grid-cols-6 gap-2">
              {emojiList.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="h-9 w-9 rounded-lg hover:bg-secondary text-lg"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-primary"
            onClick={handleVoiceNote}
          >
            <Mic className={`h-4 w-4 ${isRecording ? "text-destructive" : ""}`} />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim()}
            className="shrink-0 h-9 w-9 shadow-lg shadow-primary/20"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, isFirst }: { message: Message; isFirst: boolean }) {
  const isContact = message.sender === "contact"
  const isBot = message.sender === "bot"

  return (
    <div
      className={`flex ${isContact ? "justify-start" : "justify-end"} animate-fade-in`}
      style={{ animationDelay: isFirst ? "0ms" : "50ms" }}
    >
      <div
        className={`
          max-w-[70%] rounded-2xl px-4 py-3 shadow-sm
          ${isContact
            ? "bg-card border border-border/50 rounded-bl-md"
            : "bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/20"
          }
          ${isBot ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-foreground" : ""}
        `}
      >
        {message.attachment && (
          <div className="mb-2">
            {message.attachment.type === "image" && (
              <img
                src={message.attachment.url}
                alt={message.attachment.name}
                className="max-w-full rounded-lg border border-border/50"
              />
            )}
            {message.attachment.type === "video" && (
              <video src={message.attachment.url} controls className="max-w-full rounded-lg border border-border/50" />
            )}
            {message.attachment.type === "audio" && (
              <audio src={message.attachment.url} controls className="w-full" />
            )}
            {message.attachment.type === "file" && (
              <a
                href={message.attachment.url}
                download={message.attachment.name}
                className="text-sm text-primary underline"
              >
                {message.attachment.name}
              </a>
            )}
          </div>
        )}
        {isBot && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-1.5">
            <Bot className="h-3 w-3" />
            <span className="font-medium">Assistente IA</span>
          </div>
        )}
        {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}
        <div className={`flex items-center gap-1.5 mt-2 ${isContact ? "justify-start" : "justify-end"}`}>
          <span className={`text-xs ${isContact ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
            {message.time}
          </span>
          {message.status && !isContact && (
            <span className="text-primary-foreground/70">
              {message.status === "read" ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
