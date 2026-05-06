"use client"

import { useMemo, useRef, useState, type ChangeEvent } from "react"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { notifyAction } from "@/lib/button-actions"
import type { Conversation } from "@/lib/mock-data"
import {
  CONTACTS_TOTAL_COUNT,
  buildContactsCsv,
  buildContactsDetailUrl,
  buildContactsListUrl,
  filterContacts,
  generateContactInitials,
  getContactStatusBadgeVariant,
  getContactStatusLabel,
  getContactsFilterOptions,
  parseContactsFromCsv,
  saveContactsToStorage,
  resolveContactsListState,
} from "@/lib/contacts"
import { ContactUpsertDialog, type ContactUpsertValues } from "@/components/dashboard/contacts/contact-upsert-dialog"
import { useContactsStore } from "@/components/dashboard/contacts/use-contacts-store"
import {
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Mail,
  Phone,
  Search,
  UserPlus,
} from "lucide-react"

function toFormattedCount(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value)
}

function normalizeContactTags(tags: string) {
  return tags
    .split(/[,;]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function ContactMobileCard({
  contact,
  detailHref,
}: {
  contact: Conversation
  detailHref: string
}) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {contact.avatar || generateContactInitials(contact.name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{contact.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{contact.phone || "Sem telefone"}</p>
            <p className="truncate text-xs text-muted-foreground">{contact.email || "Sem e-mail"}</p>
          </div>
        </div>

        <Badge variant={getContactStatusBadgeVariant(contact.status)} className="rounded-full px-2.5 py-1 text-[11px]">
          {getContactStatusLabel(contact.status)}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] capitalize">
          {contact.channel}
        </Badge>
        {contact.assignee ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
            {contact.assignee}
          </Badge>
        ) : null}
        {contact.department ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
            {contact.department}
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {contact.tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {contact.phone ? (
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href={`tel:${contact.phone}`}>
              <Phone className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
        <Button asChild size="sm" className="rounded-full">
          <Link href={detailHref}>
            <ArrowUpRight className="h-4 w-4" />
            Abrir
          </Link>
        </Button>
      </div>
    </article>
  )
}

export default function ContactsListClient() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { contacts, setContacts } = useContactsStore()
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const queryState = useMemo(() => resolveContactsListState(pathname, searchParams), [pathname, searchParams])
  const filterOptions = useMemo(() => getContactsFilterOptions(contacts), [contacts])
  const visibleContacts = useMemo(() => filterContacts(contacts, queryState), [contacts, queryState])
  const nextContactId = useMemo(
    () => (contacts.length > 0 ? Math.max(...contacts.map((contact) => contact.id)) + 1 : 1),
    [contacts],
  )

  const updateUrlState = (nextState: typeof queryState) => {
    router.replace(buildContactsListUrl(pathname, nextState), { scroll: false })
  }

  const handleCreateSubmit = (values: ContactUpsertValues) => {
    const trimmedName = values.name.trim()
    const contact: Conversation = {
      id: nextContactId,
      name: trimmedName,
      avatar: generateContactInitials(trimmedName),
      channel: values.channel,
      lastMessage: "Contato cadastrado manualmente",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      unread: values.status === "novo",
      score: 50,
      tags: normalizeContactTags(values.tags),
      status: values.status,
      messages: [],
      phone: values.phone?.trim() || undefined,
      email: values.email?.trim() || undefined,
      assignee: values.assignee?.trim() || undefined,
      department: values.department?.trim() || undefined,
    }

    const nextContacts = [contact, ...contacts]
    setContacts(nextContacts)
    saveContactsToStorage(nextContacts)
    setCreateDialogOpen(false)
    notifyAction("Contato criado", `${trimmedName} adicionado à base.`)
    router.push(buildContactsDetailUrl(`/dashboard/contacts/${contact.id}`, { tab: "tickets" }))
  }

  const handleExportContacts = () => {
    const csv = buildContactsCsv(contacts)
    const filename = `contatos-${new Date().toISOString().split("T")[0]}.csv`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)

    notifyAction("Exportação pronta", `${filename} foi baixado para sua pasta de downloads.`)
  }

  const handleImportContacts = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      notifyAction("Formato inválido", "Envie um arquivo CSV para importar contatos.")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result?.toString() ?? ""
      let nextId = Math.max(...contacts.map((contact) => contact.id), 0) + 1
      const parsed = parseContactsFromCsv(text, () => {
        const currentId = nextId
        nextId += 1
        return currentId
      })

      if (parsed.length === 0) {
        notifyAction("Importação vazia", "Nenhum contato válido encontrado no arquivo.")
      } else {
        const nextContacts = [...parsed, ...contacts]
        setContacts(nextContacts)
        saveContactsToStorage(nextContacts)
        notifyAction("Importação concluída", `${parsed.length} contatos importados de ${file.name}.`)
      }

      event.target.value = ""
    }

    reader.onerror = () => {
      notifyAction("Erro na importação", "Não foi possível ler o arquivo selecionado.")
      event.target.value = ""
    }

    reader.readAsText(file, "utf-8")
  }

  const handleCreateOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
  }

  const updateSearch = (q: string) => updateUrlState({ ...queryState, q })
  const updateTag = (tag: string) => updateUrlState({ ...queryState, tag })
  const updateOwner = (owner: string) => updateUrlState({ ...queryState, owner })

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <ContactUpsertDialog
        open={createDialogOpen}
        mode="create"
        onOpenChange={handleCreateOpenChange}
        onSubmit={handleCreateSubmit}
      />

      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImportContacts}
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
              <BreadcrumbPage>Contatos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Contatos</h1>
              <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                {toFormattedCount(CONTACTS_TOTAL_COUNT)}
              </Badge>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              Centralize sua base, filtre com rapidez e abra cada contato em uma área própria de operação.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => importInputRef.current?.click()} className="rounded-full">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
            <Button variant="outline" onClick={handleExportContacts} className="rounded-full">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)} className="rounded-full">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Contato</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={queryState.q}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Buscar por nome, número ou e-mail"
              className="h-11 rounded-full border-border/70 pl-10"
            />
          </div>

          <Select value={queryState.tag} onValueChange={updateTag}>
            <SelectTrigger className="h-11 rounded-full border-border/70">
              <SelectValue placeholder="Tags" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.tags.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={queryState.owner} onValueChange={updateOwner}>
            <SelectTrigger className="h-11 rounded-full border-border/70">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.owners.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{visibleContacts.length}</span> de{" "}
            <span className="font-medium text-foreground">{contacts.length}</span> contatos carregados.
          </p>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium">
            {visibleContacts.length} resultados
          </Badge>
        </div>
      </section>

      <div className="grid gap-3 md:hidden">
        {visibleContacts.map((contact) => (
          <ContactMobileCard
            key={contact.id}
            contact={contact}
            detailHref={buildContactsDetailUrl(`/dashboard/contacts/${contact.id}`, { tab: "tickets" })}
          />
        ))}

        {visibleContacts.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum contato encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente uma busca diferente ou remova os filtros atuais.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="hidden border-border/60 bg-card/90 shadow-sm md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contato</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status Lead</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleContacts.map((contact) => {
                const detailHref = buildContactsDetailUrl(`/dashboard/contacts/${contact.id}`, { tab: "tickets" })

                return (
                  <TableRow key={contact.id} className="align-top hover:bg-muted/40">
                    <TableCell className="max-w-[18rem]">
                      <Link href={detailHref} className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {contact.avatar || generateContactInitials(contact.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{contact.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {contact.assignee || "Sem responsável"} · {contact.department || "Sem departamento"}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {contact.phone || "—"}
                    </TableCell>
                    <TableCell className="max-w-[14rem] truncate text-sm text-muted-foreground">
                      {contact.email || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getContactStatusBadgeVariant(contact.status)}
                        className="rounded-full px-2.5 py-1 text-[11px]"
                      >
                        {getContactStatusLabel(contact.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.length > 0 ? (
                          contact.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Sem tags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {contact.phone ? (
                          <Button asChild variant="ghost" size="icon" className="rounded-full">
                            <a href={`tel:${contact.phone}`} aria-label={`Ligar para ${contact.name}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : null}
                        {contact.email ? (
                          <Button asChild variant="ghost" size="icon" className="rounded-full">
                            <a href={`mailto:${contact.email}`} aria-label={`Enviar e-mail para ${contact.name}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : null}
                        <Button asChild variant="ghost" size="icon" className="rounded-full">
                          <Link href={detailHref} aria-label={`Abrir ${contact.name}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}

              {visibleContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <p className="text-sm font-medium text-foreground">Nenhum contato encontrado</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tente limpar os filtros ou faça uma nova busca.
                    </p>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
