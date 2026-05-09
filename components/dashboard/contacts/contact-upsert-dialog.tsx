"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Conversation } from "@/lib/mock-data"

const CHANNEL_OPTIONS = ["whatsapp", "instagram", "telegram", "email", "webchat"] as const
const STATUS_OPTIONS = ["novo", "ativo", "resolvido"] as const

export const contactUpsertSchema = z.object({
  name: z.string().min(2, "Informe o nome completo do contato"),
  channel: z.enum(CHANNEL_OPTIONS),
  phone: z.string().max(32).optional().or(z.literal("")),
  email: z.union([z.string().email("Informe um e-mail válido"), z.literal("")]),
  tags: z.string().optional().or(z.literal("")),
  status: z.enum(STATUS_OPTIONS),
  assignee: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
})

export type ContactUpsertValues = z.infer<typeof contactUpsertSchema>

export function getContactUpsertDefaultValues(contact?: Conversation): ContactUpsertValues {
  return {
    name: contact?.name ?? "",
    channel: contact?.channel ?? "whatsapp",
    phone: contact?.phone ?? "",
    email: contact?.email ?? "",
    tags: contact?.tags.join(", ") ?? "",
    status: contact?.status ?? "ativo",
    assignee: contact?.assignee ?? "",
    department: contact?.department ?? "",
  }
}

interface ContactUpsertDialogProps {
  open: boolean
  contact?: Conversation | null
  mode: "create" | "edit"
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ContactUpsertValues) => void
}

export function ContactUpsertDialog({
  open,
  contact,
  mode,
  onOpenChange,
  onSubmit,
}: ContactUpsertDialogProps) {
  const form = useForm<ContactUpsertValues>({
    resolver: zodResolver(contactUpsertSchema),
    defaultValues: getContactUpsertDefaultValues(contact ?? undefined),
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset(getContactUpsertDefaultValues(contact ?? undefined))
  }, [contact, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar contato" : "Novo contato"}</DialogTitle>
          <DialogDescription>
            Atualize os dados principais para manter a base pronta para operação.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Thiago Alves" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal principal</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um canal" />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANNEL_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status atual</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">Novo Lead</SelectItem>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="resolvido">Resolvido</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+55 11 99999-9999" {...field} />
                    </FormControl>
                    <FormDescription>Opcional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@email.com" {...field} />
                    </FormControl>
                    <FormDescription>Opcional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Ana Souza" {...field} />
                    </FormControl>
                    <FormDescription>Quem atende este contato.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Comercial" {...field} />
                    </FormControl>
                    <FormDescription>Classificação interna da fila.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="VIP, Prospect, Suporte" {...field} />
                  </FormControl>
                  <FormDescription>Separe as tags por vírgula.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{mode === "edit" ? "Salvar alterações" : "Criar contato"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
