"use client"

import { Button } from "@/components/ui/button"
import { MessagesSquare } from "lucide-react"
import { getConversationPriority, getConversationStatusLabel, getPriorityLabel, getPriorityTone } from "@/lib/inbox"
import { LeadInspectorShell } from "@/components/dashboard/inspector/lead-inspector-shell"
import { ContactTab } from "./contact-profile-tabs/contact-tab"
import { MediaTab } from "./contact-profile-tabs/media-tab"
import { FieldsTab } from "./contact-profile-tabs/fields-tab"
import { FunnelTab } from "./contact-profile-tabs/funnel-tab"
import { ChatbotTab } from "./contact-profile-tabs/chatbot-tab"
import { HistoryTab } from "./contact-profile-tabs/history-tab"
import type { Conversation } from "@/lib/mock-data"
import type { LeadSchedulePayload } from "@/components/dashboard/inspector/lead-operational-modals"

interface ContactProfileProps {
  conversation: Conversation
  onUpdateTags: (conversationId: number, tags: string[]) => void
  onUpdateScore: (conversationId: number, score: number) => void
  onUpdateProfile: (conversationId: number, updates: Partial<Conversation>) => void
  onScheduleMeeting: (conversationId: number, nextMeeting: LeadSchedulePayload) => void
  onOpenInternalChat?: () => void
  onCloseInspector: () => void
}

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "E-mail",
  webchat: "Chat do site",
}

export function ContactProfile({
  conversation,
  onUpdateTags,
  onUpdateScore,
  onUpdateProfile,
  onScheduleMeeting,
  onOpenInternalChat,
  onCloseInspector,
}: ContactProfileProps) {
  const priority = getConversationPriority(conversation)
  const priorityLabel = getPriorityLabel(priority)
  const priorityTone = getPriorityTone(priority)
  const noteCount = conversation.internalNotes?.length ?? 0

  return (
    <LeadInspectorShell
      title={conversation.name}
      subtitle={`${channelLabels[conversation.channel]} • ${conversation.assignee || "Sem responsável"}`}
      avatar={conversation.avatar}
      badges={[
        { label: getConversationStatusLabel(conversation), variant: "outline" },
        { label: priorityLabel, variant: priorityTone },
        { label: `Score ${conversation.score}`, variant: "secondary" },
        { label: `${noteCount} nota${noteCount === 1 ? "" : "s"}`, variant: "secondary" },
      ]}
      actions={
        onOpenInternalChat ? (
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-full border-border/60 bg-background px-3 text-xs font-medium shadow-sm"
            onClick={onOpenInternalChat}
          >
            <MessagesSquare className="mr-2 h-4 w-4" />
            Chat interno
          </Button>
        ) : undefined
      }
      onClose={onCloseInspector}
      contactTab={
        <ContactTab
          conversation={conversation}
          onUpdateTags={onUpdateTags}
          onUpdateScore={onUpdateScore}
          onUpdateProfile={onUpdateProfile}
          onScheduleMeeting={onScheduleMeeting}
        />
      }
      mediaTab={<MediaTab conversation={conversation} />}
      fieldsTab={<FieldsTab conversation={conversation} onUpdateProfile={onUpdateProfile} />}
      funnelTab={<FunnelTab conversation={conversation} onUpdateProfile={onUpdateProfile} />}
      chatbotTab={<ChatbotTab conversation={conversation} onUpdateProfile={onUpdateProfile} />}
      historyTab={<HistoryTab conversation={conversation} />}
    />
  )
}
