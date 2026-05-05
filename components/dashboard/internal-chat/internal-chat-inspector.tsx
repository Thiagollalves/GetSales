"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getPresenceLabel, getTeamMember } from "@/lib/internal-chat"
import type { InternalConversation, InternalMessage, TeamMember } from "@/lib/internal-chat"
import {
  FileText,
  Hash,
  Link2,
  Paperclip,
  Pin,
  Reply,
  Users,
} from "lucide-react"

interface InternalChatInspectorProps {
  conversation: InternalConversation | null
  members: TeamMember[]
  onOpenLeadContext?: () => void
}

function extractAttachments(conversation: InternalConversation) {
  const attachments = conversation.messages.flatMap((message) =>
    (message.attachments ?? []).map((attachment) => ({
      ...attachment,
      authorId: message.authorId,
      time: message.time,
    })),
  )

  return attachments
}

function buildThreadRoots(conversation: InternalConversation) {
  return conversation.messages
    .filter((message) => message.replyToId === undefined)
    .map((message) => {
      const replies = conversation.messages.filter((item) => item.replyToId === message.id)
      return { message, replies }
    })
    .filter(({ replies }) => replies.length > 0)
}

function MessagePreview({ message, members }: { message: InternalMessage; members: TeamMember[] }) {
  const author = getTeamMember(message.authorId) ?? members.find((member) => member.id === message.authorId)
  return (
    <div className="rounded-[18px] border border-border/60 bg-background/90 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-foreground">{author?.name ?? "Usuário"}</p>
        <span className="text-[11px] text-muted-foreground">{message.time}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{message.content}</p>
    </div>
  )
}

export function InternalChatInspector({ conversation, members, onOpenLeadContext }: InternalChatInspectorProps) {
  const files = useMemo(() => (conversation ? extractAttachments(conversation) : []), [conversation])
  const threads = useMemo(() => (conversation ? buildThreadRoots(conversation) : []), [conversation])
  const pinnedMessages = conversation?.messages.filter((message) => message.pinned) ?? []
  const memberCards = conversation?.memberIds
    .map((memberId) => getTeamMember(memberId))
    .filter(Boolean) ?? []

  if (!conversation) {
    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,239,0.92))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="flex h-full items-center justify-center px-4 py-8 text-center">
          <div className="max-w-sm space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Inspector interno</p>
            <h3 className="text-2xl font-semibold text-foreground">Selecione uma conversa</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              O contexto do time, os arquivos, os fixados e os threads aparecem aqui quando uma conversa é aberta.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,239,0.92))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur sm:rounded-[30px]">
      <div className="border-b border-border/60 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Inspector da conversa</p>
        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-base font-semibold text-foreground">
            {conversation.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-foreground">{conversation.name}</h3>
            <p className="truncate text-sm text-muted-foreground">{conversation.description ?? "Contexto da equipe"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                {conversation.lastMessageAt}
              </Badge>
              {conversation.relatedLeadName ? (
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  Lead: {conversation.relatedLeadName}
                </Badge>
              ) : null}
              {conversation.pinned ? (
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  <Pin className="mr-1 h-3 w-3" />
                  Fixado
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <Accordion type="multiple" defaultValue={["members", "files", "pinned", "threads", "context"]} className="space-y-3">
          <AccordionItem value="members" className="overflow-hidden rounded-[22px] border border-border/60 bg-background/90 shadow-sm">
            <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Membros</p>
                  <p className="text-sm font-medium text-foreground">{memberCards.length} participantes</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {memberCards.map((member) => (
                  <div key={member?.id} className="flex items-center gap-3 rounded-[18px] border border-border/60 bg-muted/20 px-3 py-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-semibold text-foreground">
                      {member?.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{member?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member?.role} • {member ? getPresenceLabel(member.presence) : "Offline"}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full px-2 py-1 text-[10px] font-medium">
                      {member?.title ?? "Equipe"}
                    </Badge>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="files" className="overflow-hidden rounded-[22px] border border-border/60 bg-background/90 shadow-sm">
            <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Arquivos</p>
                  <p className="text-sm font-medium text-foreground">{files.length} anexos</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {files.length > 0 ? (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 rounded-[18px] border border-border/60 bg-muted/20 px-3 py-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.sizeLabel ?? file.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[18px] border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
                    Nenhum arquivo anexado nesta conversa.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pinned" className="overflow-hidden rounded-[22px] border border-border/60 bg-background/90 shadow-sm">
            <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Fixados</p>
                  <p className="text-sm font-medium text-foreground">{pinnedMessages.length} mensagens</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {pinnedMessages.length > 0 ? (
                  pinnedMessages.map((message) => (
                    <MessagePreview key={message.id} message={message} members={members} />
                  ))
                ) : (
                  <p className="rounded-[18px] border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
                    Nenhuma mensagem fixada.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="threads" className="overflow-hidden rounded-[22px] border border-border/60 bg-background/90 shadow-sm">
            <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
              <div className="flex items-center gap-2">
                <Reply className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Threads</p>
                  <p className="text-sm font-medium text-foreground">{threads.length} encadeamentos</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {threads.length > 0 ? (
                  threads.map(({ message, replies }) => (
                    <div key={message.id} className="rounded-[18px] border border-border/60 bg-muted/20 px-3 py-2.5">
                      <MessagePreview message={message} members={members} />
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{replies.length} resposta(s)</span>
                        <span>{message.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[18px] border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
                    Nenhuma thread criada ainda.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="context" className="overflow-hidden rounded-[22px] border border-border/60 bg-background/90 shadow-sm">
            <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Contexto do lead</p>
                  <p className="text-sm font-medium text-foreground">{conversation.relatedLeadName ?? "Sem vínculo"}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {conversation.relatedLeadName ? (
                <div className="space-y-3 rounded-[18px] border border-border/60 bg-muted/20 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-semibold text-foreground">
                      {conversation.relatedLeadName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{conversation.relatedLeadName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {conversation.relatedLeadChannel ?? "Canal"} • {conversation.relatedLeadAssignee ?? "Sem responsável"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] font-medium">
                      <Hash className="mr-1 h-3 w-3" />
                      Lead {conversation.relatedLeadId}
                    </Badge>
                    {conversation.relatedLeadPipeline ? (
                      <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[10px] font-medium">
                        Pipeline: {conversation.relatedLeadPipeline}
                      </Badge>
                    ) : null}
                  </div>
                  <Button variant="outline" className="w-full rounded-full bg-transparent" onClick={onOpenLeadContext}>
                    Abrir lead
                  </Button>
                </div>
              ) : (
                <p className="rounded-[18px] border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
                  Esta conversa não veio de um lead vinculado.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
