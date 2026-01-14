"use client"

import { useState } from "react"
import { ConversationList } from "@/components/dashboard/inbox/conversation-list"
import { ChatWindow } from "@/components/dashboard/inbox/chat-window"
import { ContactProfile } from "@/components/dashboard/inbox/contact-profile"
import { toast } from "sonner"
import { initialConversations, Conversation, Message } from "@/lib/mock-data"


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
