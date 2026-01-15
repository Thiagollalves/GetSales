"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ConversationList } from "@/components/dashboard/inbox/conversation-list"
import { ChatWindow } from "@/components/dashboard/inbox/chat-window"
import { ContactProfile } from "@/components/dashboard/inbox/contact-profile"
import { toast } from "sonner"
import { initialConversations, type Conversation, type Message, type Attachment } from "@/lib/mock-data"
import { useRouter, useSearchParams } from "next/navigation"

export type { Conversation, Message, Attachment }

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedId, setSelectedId] = useState<number | null>(1)
  const [showProfile, setShowProfile] = useState(true)
  const [newChatCounter, setNewChatCounter] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasHandledQueryRef = useRef(false)

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null

  const createConversation = useCallback(() => {
    const counter = newChatCounter
    const name = `Novo contato ${counter}`
    const avatar = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const newConversation: Conversation = {
      id: Date.now(),
      name,
      avatar,
      channel: "whatsapp",
      lastMessage: "Nova conversa iniciada",
      time: "Agora",
      unread: false,
      score: 50,
      tags: [],
      messages: [],
      status: "novo",
      assignee: "Atendimento",
      phone: "",
      email: "",
      location: "",
      customerSince: "Agora",
    }

    setConversations((prev) => [newConversation, ...prev])
    setSelectedId(newConversation.id)
    setShowProfile(true)
    setNewChatCounter((prev) => prev + 1)
  }, [newChatCounter])

  useEffect(() => {
    const stored = localStorage.getItem("inbox_conversations")
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Conversation[]
        if (parsed.length > 0) {
          setConversations(parsed)
        }
      } catch (error) {
        console.warn("Failed to load conversations", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("inbox_conversations", JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    const handleNewConversation = () => {
      createConversation()
    }

    window.addEventListener("dashboard:new-conversation", handleNewConversation)
    return () => window.removeEventListener("dashboard:new-conversation", handleNewConversation)
  }, [createConversation])

  useEffect(() => {
    const shouldCreate = searchParams.get("newConversation") === "1"
    if (!shouldCreate || hasHandledQueryRef.current) return

    createConversation()
    hasHandledQueryRef.current = true
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete("newConversation")
    const nextQuery = nextParams.toString()
    router.replace(`/dashboard/inbox${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false })
  }, [createConversation, router, searchParams])

  const handleSendMessage = async ({ text, attachment }: { text?: string; attachment?: Attachment }) => {
    if (!selectedConversation) return
    if (!text && !attachment) return

    const newMessage: Message = {
      id: Date.now(),
      content: text ?? "",
      sender: "agent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      attachment,
    }

    // Update local state immediately
    const updatedConversations = conversations.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: text || attachment?.name || "Anexo enviado",
          time: "Agora",
          unread: false,
        }
      }
      return c
    })
    setConversations(updatedConversations)

    // Call API if channel is WhatsApp
    if (selectedConversation.channel === 'whatsapp' && text) {
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
                message: text ?? "",
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

  const handleUpdateTags = (conversationId: number, tags: string[]) => {
    setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, tags } : c)))
  }

  const handleUpdateScore = (conversationId: number, score: number) => {
    setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, score } : c)))
  }

  const handleUpdateProfile = (conversationId: number, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c
        const nextName = updates.name ?? c.name
        const nextAvatar = nextName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
        return { ...c, ...updates, avatar: nextAvatar }
      })
    )
  }

  const handleScheduleMeeting = (conversationId: number, nextMeeting: string) => {
    setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, nextMeeting } : c)))
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
          {showProfile && (
            <ContactProfile
              conversation={selectedConversation}
              onUpdateTags={handleUpdateTags}
              onUpdateScore={handleUpdateScore}
              onUpdateProfile={handleUpdateProfile}
              onScheduleMeeting={handleScheduleMeeting}
            />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Selecione uma conversa para começar
        </div>
      )}
    </div>
  )
}
