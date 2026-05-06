"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notifyAction } from "@/lib/button-actions"
import type { Conversation } from "@/lib/mock-data"
import {
  buildContactsDetailUrl,
  contactsDetailTabItems,
  findContactById,
  generateContactInitials,
  getContactStatusBadgeVariant,
  getContactStatusLabel,
  saveContactsToStorage,
  resolveContactDetailState,
} from "@/lib/contacts"
import { useContactsStore } from "@/components/dashboard/contacts/use-contacts-store"
import { ContactUpsertDialog, type ContactUpsertValues } from "@/components/dashboard/contacts/contact-upsert-dialog"
import {
  ArrowLeft,
  ChartColumnBig,
  FileImage,
  History,
  Images,
  MessageSquarePlus,
  PanelRightClose,
  Phone,
  PencilLine,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react"

function normalizeContactTags(tags?: string | null) {
  return (tags ?? "")
    .split(/[,;]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function formatCustomerSince(value?: string) {
  if (!value) {
    return "Cliente há pouco tempo"
  }

  return `Cliente desde ${value}`
}

function getTicketCount(contact: Conversation) {
  return contact.timeline?.filter((item) => item.kind === "ticket").length ?? 0
}

function getMediaCount(contact: Conversation) {
  return contact.media?.length ?? 0
}

function getCustomFieldCount(contact: Conversation) {
  return contact.customFields?.length ?? 0
}

function getScheduledCount(contact: Conversation) {
  return contact.scheduledAt ? 1 : 0
}

function ContactEmptyState() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-[30px] border border-border/60 bg-card/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6 sm:py-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/contacts">Contatos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contato não encontrado</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      <Empty className="rounded-[30px] border border-border/60 bg-card/90 shadow-sm">
        <EmptyContent>
          <EmptyHeader>
            <EmptyTitle>Contato não encontrado</EmptyTitle>
            <EmptyDescription>
              O contato solicitado não existe na base local atual. Volte para a lista e escolha outro registro.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/contacts">
              <ArrowLeft className="h-4 w-4" />
              Voltar para contatos
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

function DetailSectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof UserRound
  children: ReactNode
}) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

export default function ContactDetailClient({ contactId }: { contactId: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { contacts, setContacts } = useContactsStore()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const detailState = useMemo(() => resolveContactDetailState(pathname, searchParams), [pathname, searchParams])
  const contact = useMemo(() => findContactById(contacts, contactId), [contacts, contactId])

  const handleTabChange = (tab: string) => {
    const nextTab = contactsDetailTabItems.some((item) => item.value === tab)
      ? (tab as typeof detailState.tab)
      : detailState.tab

    router.replace(buildContactsDetailUrl(pathname, { tab: nextTab }), { scroll: false })
  }

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push("/dashboard/contacts")
  }

  const handleNewAttendance = () => {
    notifyAction("Novo atendimento", `Abrindo um novo atendimento para ${contact?.name ?? "este contato"}.`)
  }

  const handleEditSubmit = (values: ContactUpsertValues) => {
    if (!contact) {
      return
    }

    const trimmedName = values.name.trim()
    const nextContact: Conversation = {
      ...contact,
      name: trimmedName,
      avatar: generateContactInitials(trimmedName),
      channel: values.channel,
      phone: values.phone?.trim() || undefined,
      email: values.email?.trim() || undefined,
      tags: normalizeContactTags(values.tags),
      status: values.status,
      assignee: values.assignee?.trim() || undefined,
      department: values.department?.trim() || undefined,
    }

    const nextContacts = contacts.map((item) => (item.id === contact.id ? nextContact : item))
    setContacts(nextContacts)
    saveContactsToStorage(nextContacts)
    setEditDialogOpen(false)
    notifyAction("Contato atualizado", `${trimmedName} foi atualizado com sucesso.`)
  }

  if (!contact) {
    return <ContactEmptyState />
  }

  const ticketCount = getTicketCount(contact)
  const mediaCount = getMediaCount(contact)
  const fieldCount = getCustomFieldCount(contact)
  const scheduledCount = getScheduledCount(contact)
  const customerSinceLabel = formatCustomerSince(contact.customerSince)

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <ContactUpsertDialog
        open={editDialogOpen}
        contact={contact}
        mode="edit"
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />

      <section className="rounded-[30px] border border-border/60 bg-card/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6 sm:py-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/contacts">Contatos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{contact.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              {contact.avatar || generateContactInitials(contact.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {contact.name}
                </h1>
                <Badge
                  variant={getContactStatusBadgeVariant(contact.status)}
                  className="rounded-full px-3 py-1 text-[11px] font-medium"
                >
                  {getContactStatusLabel(contact.status)}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {contact.phone || "Sem telefone"} · {contact.email || "Sem e-mail"} · {contact.department || "Sem departamento"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleNewAttendance} className="rounded-full">
              <MessageSquarePlus className="h-4 w-4" />
              Novo Atendimento
            </Button>
            {contact.phone ? (
              <Button asChild variant="outline" size="icon" className="rounded-full">
                <a href={`tel:${contact.phone}`} aria-label={`Ligar para ${contact.name}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
            <Button variant="outline" size="icon" className="rounded-full" onClick={handleClose} aria-label="Fechar detalhe">
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
            {ticketCount} ticket{ticketCount === 1 ? "" : "s"}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium">
            {customerSinceLabel}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium capitalize">
            {contact.channel}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium">
            Score {contact.score}
          </Badge>
        </div>
      </section>

      <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <aside className="space-y-4">
          <DetailSectionCard title="Contato" icon={UserRound}>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Telefone</p>
                <p className="mt-1 font-medium text-foreground">{contact.phone || "Sem telefone"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">E-mail</p>
                <p className="mt-1 font-medium text-foreground">{contact.email || "Sem e-mail"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Responsável</p>
                <p className="mt-1 font-medium text-foreground">{contact.assignee || "Sem responsável"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Departamento</p>
                <p className="mt-1 font-medium text-foreground">{contact.department || "Sem departamento"}</p>
              </div>
            </div>
          </DetailSectionCard>

          <DetailSectionCard title="Classificação" icon={Sparkles}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Score</span>
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {contact.score}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Canal</span>
                <span className="font-medium text-foreground capitalize">{contact.channel}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-foreground">{getContactStatusLabel(contact.status)}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {contact.tags.length > 0 ? (
                    contact.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Sem tags</span>
                  )}
                </div>
              </div>
            </div>
          </DetailSectionCard>

          <DetailSectionCard title="Histórico" icon={History}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Cliente desde</span>
                <span className="font-medium text-foreground">{contact.customerSince || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Última mensagem</span>
                <span className="max-w-[14rem] truncate font-medium text-foreground">{contact.lastMessage}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Tickets</span>
                <span className="font-medium text-foreground">{ticketCount}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Mensagens agendadas</span>
                <span className="font-medium text-foreground">{scheduledCount}</span>
              </div>
            </div>

            <div className="mt-4">
              <Button variant="outline" className="w-full rounded-full" onClick={() => setEditDialogOpen(true)}>
                <PencilLine className="h-4 w-4" />
                Editar contato
              </Button>
            </div>
          </DetailSectionCard>
        </aside>

        <Card className="min-h-0 border-border/60 bg-card/95 shadow-sm">
          <Tabs
            value={detailState.tab}
            onValueChange={handleTabChange}
            className="flex min-h-0 h-full flex-col"
          >
            <div className="border-b border-border/60 px-4 py-4">
              <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-[18px] bg-muted/40 p-1.5">
                {contactsDetailTabItems.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="min-w-[7.5rem] flex-1 rounded-[14px] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] sm:min-w-[8rem]"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="tickets" className="m-0 min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
                <Card className="border-border/60 bg-background/70 shadow-sm">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Tickets</p>
                        <h3 className="mt-1 text-base font-semibold text-foreground">Atendimento recente</h3>
                      </div>
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium">
                        {ticketCount} aberto{ticketCount === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {contact.messages.length > 0 ? (
                        contact.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`rounded-2xl border px-3 py-2 text-sm ${
                              message.sender === "contact"
                                ? "border-border/60 bg-muted/30"
                                : "border-primary/20 bg-primary/5"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-foreground">
                                {message.sender === "contact" ? contact.name : "Operação"}
                              </span>
                              <span className="text-xs text-muted-foreground">{message.time}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{message.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
                          Nenhuma mensagem registrada neste contato.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-background/70 shadow-sm">
                  <CardContent className="space-y-4 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Resumo</p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">Operação</h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 px-3 py-2">
                        <span className="text-muted-foreground">Tickets</span>
                        <span className="font-medium text-foreground">{ticketCount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 px-3 py-2">
                        <span className="text-muted-foreground">Mídia</span>
                        <span className="font-medium text-foreground">{mediaCount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 px-3 py-2">
                        <span className="text-muted-foreground">Campos</span>
                        <span className="font-medium text-foreground">{fieldCount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 px-3 py-2">
                        <span className="text-muted-foreground">Agendamentos</span>
                        <span className="font-medium text-foreground">{scheduledCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="media" className="m-0 min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-4">
                <Card className="border-border/60 bg-background/70 shadow-sm">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Images className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Mídia</p>
                        <h3 className="text-base font-semibold text-foreground">Arquivos e anexos</h3>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {contact.media && contact.media.length > 0 ? (
                        contact.media.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-border/60 bg-card p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <FileImage className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.time}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="mt-3 rounded-full px-2.5 py-1 text-[11px] font-medium">
                              {item.type}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
                          Nenhuma mídia anexada neste contato.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="m-0 min-h-0 flex-1 overflow-y-auto p-4">
              <Card className="border-border/60 bg-background/70 shadow-sm">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ChartColumnBig className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Campos personalizados</p>
                      <h3 className="text-base font-semibold text-foreground">Dados complementares</h3>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {contact.customFields && contact.customFields.length > 0 ? (
                      contact.customFields.map((field) => (
                        <div key={field.id} className="rounded-2xl border border-border/60 bg-card p-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{field.label}</p>
                          <p className="mt-1 text-sm font-medium text-foreground">{field.value}</p>
                        </div>
                      ))
                    ) : (
                      <div className="md:col-span-2 rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
                        Nenhum campo personalizado preenchido.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="m-0 min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-border/60 bg-background/70 shadow-sm">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Ticket className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Funis</p>
                        <h3 className="text-base font-semibold text-foreground">Atuação atual</h3>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 px-3 py-4 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Etapa atual</span>
                        <span className="font-medium text-foreground">{contact.pipeline || "Sem etapa"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-background/70 shadow-sm">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Engajamento</p>
                        <h3 className="text-base font-semibold text-foreground">Interações e automação</h3>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border/60 bg-card p-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Campanhas</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{contact.tags.length}</p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-card p-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Agendadas</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{scheduledCount}</p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-card p-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Bot</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {contact.botBindings?.filter((item) => item.enabled).length ?? 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="m-0 min-h-0 flex-1 overflow-y-auto p-4">
              <Card className="border-border/60 bg-background/70 shadow-sm">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <History className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Histórico</p>
                      <h3 className="text-base font-semibold text-foreground">Linha do tempo</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contact.timeline && contact.timeline.length > 0 ? (
                      contact.timeline.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-border/60 bg-card p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <span className="text-xs text-muted-foreground">{item.time}</span>
                          </div>
                          {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
                        Nenhum evento registrado no histórico.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
