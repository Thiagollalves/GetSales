"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-mobile"
import { CalendarDays, Clock3, MessageSquareText, UserRound } from "lucide-react"

export interface LeadSchedulePayload {
  date: string
  time: string
  assignee: string
  message: string
}

export interface LeadCloseTicketPayload {
  reason: string
  note: string
}

interface LeadScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: string
  initialTime?: string
  initialAssignee?: string
  initialMessage?: string
  onConfirm: (payload: LeadSchedulePayload) => void
}

interface LeadCloseTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (payload: LeadCloseTicketPayload) => void
}

const assigneeOptions = ["Ana Souza", "Camila Rocha", "Time Comercial", "Equipe Bot", "Suporte", "Onboarding"]

const closeReasons = [
  "Atendimento concluído",
  "Lead sem interesse",
  "Lead sem resposta",
  "Agendado em outro canal",
  "Duplicado",
  "Outro",
]

function parseDateInput(value?: string) {
  const normalized = value?.trim()
  if (!normalized) return undefined

  if (normalized.includes("/")) {
    const [day, month, year] = normalized.split("/")
    if (day && month && year) {
      const parsed = new Date(Number(year), Number(month) - 1, Number(day))
      return Number.isNaN(parsed.getTime()) ? undefined : parsed
    }
  }

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function LeadScheduleForm({
  date,
  time,
  assignee,
  message,
  onDateChange,
  onTimeChange,
  onAssigneeChange,
  onMessageChange,
}: {
  date: Date | undefined
  time: string
  assignee: string
  message: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (value: string) => void
  onAssigneeChange: (value: string) => void
  onMessageChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Data</h4>
        </div>
        <Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus />
      </section>

      <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Horário</label>
            <Input
              type="time"
              value={time}
              onChange={(event) => onTimeChange(event.target.value)}
              className="h-11 rounded-full bg-background/90 px-4"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Responsável</label>
            <Select value={assignee} onValueChange={onAssigneeChange}>
              <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {assigneeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Mensagem</h4>
        </div>
        <Textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Digite a mensagem que será enviada depois..."
          className="min-h-32 rounded-[20px] bg-background/90"
        />
      </section>
    </div>
  )
}

export function LeadScheduleModal({
  open,
  onOpenChange,
  initialDate,
  initialTime,
  initialAssignee,
  initialMessage,
  onConfirm,
}: LeadScheduleModalProps) {
  const isMobile = useIsMobile()
  const [date, setDate] = useState<Date | undefined>(parseDateInput(initialDate))
  const [time, setTime] = useState(initialTime ?? "10:30")
  const [assignee, setAssignee] = useState(initialAssignee ?? "")
  const [message, setMessage] = useState(initialMessage ?? "")

  useEffect(() => {
    if (!open) return

    setDate(parseDateInput(initialDate))
    setTime(initialTime ?? "10:30")
    setAssignee(initialAssignee ?? "")
    setMessage(initialMessage ?? "")
  }, [open, initialAssignee, initialDate, initialMessage, initialTime])

  const formattedDate = useMemo(() => (date ? formatDate(date) : ""), [date])

  const handleConfirm = () => {
    if (!date) return

    onConfirm({
      date: formattedDate,
      time,
      assignee: assignee.trim() || "Sem responsável",
      message: message.trim(),
    })
    onOpenChange(false)
  }

  const content = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/60 px-5 py-4 text-left">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Agendar mensagem</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina quando a mensagem deve sair, quem é o responsável e qual o texto da ação.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <LeadScheduleForm
          date={date}
          time={time}
          assignee={assignee}
          message={message}
          onDateChange={setDate}
          onTimeChange={setTime}
          onAssigneeChange={setAssignee}
          onMessageChange={setMessage}
        />
      </div>

      <DialogFooter className="border-t border-border/60 px-5 py-4">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full bg-transparent" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="flex-1 rounded-full" onClick={handleConfirm} disabled={!date}>
            Agendar
          </Button>
        </div>
      </DialogFooter>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Agendar mensagem</DrawerTitle>
            <DrawerDescription>Defina data, horário, responsável e texto da mensagem.</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[92dvh] w-full max-w-[720px] overflow-hidden p-0">
        <div className="sr-only">
          <DialogHeader>
            <DialogTitle>Agendar mensagem</DialogTitle>
            <DialogDescription>Defina data, horário, responsável e texto da mensagem.</DialogDescription>
          </DialogHeader>
        </div>
        {content}
      </DialogContent>
    </Dialog>
  )
}

function CloseTicketForm({
  reason,
  note,
  onReasonChange,
  onNoteChange,
}: {
  reason: string
  note: string
  onReasonChange: (value: string) => void
  onNoteChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Motivo do fechamento</h4>
        </div>
        <Select value={reason} onValueChange={onReasonChange}>
          <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
            <SelectValue placeholder="Selecionar" />
          </SelectTrigger>
          <SelectContent>
            {closeReasons.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Observação interna</h4>
        </div>
        <Textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Contexto adicional para o fechamento..."
          className="min-h-28 rounded-[20px] bg-background/90"
        />
      </section>
    </div>
  )
}

export function LeadCloseTicketModal({
  open,
  onOpenChange,
  onConfirm,
}: LeadCloseTicketModalProps) {
  const isMobile = useIsMobile()
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!open) return

    setReason("")
    setNote("")
  }, [open])

  const handleConfirm = () => {
    if (!reason) return

    onConfirm({ reason, note })
    onOpenChange(false)
  }

  const content = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/60 px-5 py-4 text-left">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Fechar ticket</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha o motivo do fechamento e, se quiser, deixe uma observação para o histórico.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <CloseTicketForm reason={reason} note={note} onReasonChange={setReason} onNoteChange={setNote} />
      </div>

      <DrawerFooter className="border-t border-border/60 px-5 py-4">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full bg-transparent" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="flex-1 rounded-full" onClick={handleConfirm} disabled={!reason}>
            Fechar ticket
          </Button>
        </div>
      </DrawerFooter>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90dvh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Fechar ticket</DrawerTitle>
            <DrawerDescription>Escolha o motivo do fechamento e registre uma observação.</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[90dvh] w-full max-w-[640px] overflow-hidden p-0">
        <div className="sr-only">
          <DialogHeader>
            <DialogTitle>Fechar ticket</DialogTitle>
            <DialogDescription>Escolha o motivo do fechamento e registre uma observação.</DialogDescription>
          </DialogHeader>
        </div>
        {content}
      </DialogContent>
    </Dialog>
  )
}
