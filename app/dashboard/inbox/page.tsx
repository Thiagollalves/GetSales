"use client"

import { useState } from "react"
import { ConversationList } from "@/components/dashboard/inbox/conversation-list"
import { ChatWindow } from "@/components/dashboard/inbox/chat-window"
import { ContactProfile } from "@/components/dashboard/inbox/contact-profile"

export interface Conversation {
  id: number
  name: string
  avatar: string
  channel: "whatsapp" | "instagram" | "telegram" | "email" | "webchat"
  lastMessage: string
  time: string
  unread: boolean
  score: number
  tags: string[]
  messages: Message[]
}

export interface Message {
  id: number
  content: string
  sender: "contact" | "agent" | "bot"
  time: string
  status?: "sent" | "delivered" | "read"
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    name: "Maria Silva",
    avatar: "MS",
    channel: "whatsapp",
    lastMessage: "Gostaria de saber mais sobre o plano Growth...",
    time: "2 min",
    unread: true,
    score: 85,
    tags: ["VIP", "Interessado"],
    messages: [
      { id: 1, content: "Olá! Vi o anúncio de vocês no Instagram", sender: "contact", time: "10:30" },
      {
        id: 2,
        content: "Olá Maria! Seja bem-vinda. Como posso ajudar?",
        sender: "agent",
        time: "10:32",
        status: "read",
      },
      { id: 3, content: "Quero saber mais sobre os planos disponíveis", sender: "contact", time: "10:33" },
      {
        id: 4,
        content: "Claro! Temos 3 planos: Start (R$299), Growth (R$699) e Scale (R$1.499). Qual deles te interessa?",
        sender: "agent",
        time: "10:35",
        status: "read",
      },
      { id: 5, content: "Gostaria de saber mais sobre o plano Growth...", sender: "contact", time: "10:40" },
    ],
  },
  {
    id: 2,
    name: "João Santos",
    avatar: "JS",
    channel: "instagram",
    lastMessage: "O bot respondeu minha dúvida, obrigado!",
    time: "15 min",
    unread: false,
    score: 62,
    tags: ["Lead"],
    messages: [
      { id: 1, content: "Oi, vocês fazem integração com Shopify?", sender: "contact", time: "09:15" },
      {
        id: 2,
        content: "Sim! Temos integração nativa com Shopify. Posso te enviar a documentação?",
        sender: "bot",
        time: "09:15",
      },
      { id: 3, content: "O bot respondeu minha dúvida, obrigado!", sender: "contact", time: "09:20" },
    ],
  },
  {
    id: 3,
    name: "Ana Costa",
    avatar: "AC",
    channel: "telegram",
    lastMessage: "Preciso de suporte técnico urgente",
    time: "32 min",
    unread: true,
    score: 78,
    tags: ["Cliente", "Suporte"],
    messages: [{ id: 1, content: "Preciso de suporte técnico urgente", sender: "contact", time: "09:00" }],
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    avatar: "CO",
    channel: "email",
    lastMessage: "Quando posso agendar uma demonstração?",
    time: "1h",
    unread: false,
    score: 45,
    tags: ["Prospect"],
    messages: [
      { id: 1, content: "Quando posso agendar uma demonstração?", sender: "contact", time: "08:30" },
      {
        id: 2,
        content: "Olá Carlos! Temos horários disponíveis amanhã às 10h ou 15h. Qual prefere?",
        sender: "agent",
        time: "08:45",
        status: "delivered",
      },
    ],
  },
  {
    id: 5,
    name: "Fernanda Lima",
    avatar: "FL",
    channel: "webchat",
    lastMessage: "Vocês têm trial gratuito?",
    time: "2h",
    unread: false,
    score: 55,
    tags: ["Lead"],
    messages: [
      { id: 1, content: "Vocês têm trial gratuito?", sender: "contact", time: "07:30" },
      { id: 2, content: "Sim! Oferecemos 14 dias de teste gratuito.", sender: "bot", time: "07:30" },
    ],
  },
]

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0])
  const [showProfile, setShowProfile] = useState(true)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ConversationList
        conversations={mockConversations}
        selectedId={selectedConversation?.id ?? null}
        onSelect={setSelectedConversation}
      />
      {selectedConversation ? (
        <>
          <ChatWindow conversation={selectedConversation} onToggleProfile={() => setShowProfile(!showProfile)} />
          {showProfile && <ContactProfile conversation={selectedConversation} />}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Selecione uma conversa para começar
        </div>
      )}
    </div>
  )
}
