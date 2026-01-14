"use client"

import { useState } from "react"
import { ConversationList } from "@/components/dashboard/inbox/conversation-list"
import { ChatWindow } from "@/components/dashboard/inbox/chat-window"
import { ContactProfile } from "@/components/dashboard/inbox/contact-profile"
import { toast } from "sonner"

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
  phone?: string // Added for API
}

export interface Message {
  id: number
  content: string
  sender: "contact" | "agent" | "bot"
  time: string
  status?: "sent" | "delivered" | "read"
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "Thiago Alves", // Exemplo para demo
    avatar: "TA",
    channel: "whatsapp",
    lastMessage: "Gostaria de saber mais sobre o plano Growth...",
    time: "2 min",
    unread: true,
    score: 85,
    tags: ["VIP", "Interessado"],
    phone: "5511999999999", // Placeholder, user should update in code or DB for real test
    messages: [
      { id: 1, content: "Olá! Vi o anúncio de vocês no Instagram", sender: "contact", time: "10:30" },
      {
        id: 2,
        content: "Olá Thiago! Seja bem-vindo. Como posso ajudar?",
        sender: "agent",
        time: "10:32",
        status: "read",
      },
      { id: 3, content: "Quero saber mais sobre os planos disponíveis", sender: "contact", time: "10:33" },
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
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedId, setSelectedId] = useState<number | null>(1)
  const [showProfile, setShowProfile] = useState(true)

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return

    const newMessage: Message = {
      id: Date.now(),
      content: text,
      sender: "agent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    }

    // Update local state immediately
    const updatedConversations = conversations.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: text,
          time: "Agora"
        }
      }
      return c
    })
    setConversations(updatedConversations)

    // Call API if channel is WhatsApp
    if (selectedConversation.channel === 'whatsapp') {
      const token = localStorage.getItem("wh_access_token");
      const phoneId = localStorage.getItem("wh_phone_id");
      // Use phone from conversation or fallback
      const targetPhone = selectedConversation.phone;

      if (token && phoneId && targetPhone) {
        try {
          toast.promise(
            fetch('/api/whatsapp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone: targetPhone,
                message: text,
                token,
                phoneId
              })
            }).then(async res => {
              if (!res.ok) throw new Error('Falha no envio API');
              return res.json();
            }),
            {
              loading: 'Enviando p/ WhatsApp...',
              success: 'Enviado com sucesso!',
              error: 'Erro ao enviar p/ API'
            }
          );
        } catch (error) {
          console.error("Failed to send", error);
        }
      } else if (!targetPhone) {
        console.warn("No phone number for contact");
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={(c) => setSelectedId(c.id)}
      />
      {selectedConversation ? (
        <>
          <ChatWindow
            conversation={selectedConversation}
            onToggleProfile={() => setShowProfile(!showProfile)}
            onSendMessage={handleSendMessage}
          />
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
