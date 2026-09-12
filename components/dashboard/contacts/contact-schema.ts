import { z } from "zod";

export const CHANNEL_OPTIONS = ["whatsapp", "instagram", "telegram", "email", "webchat"] as const;
export const STATUS_OPTIONS = ["novo", "ativo", "resolvido"] as const;

export const contactFormSchema = z.object({
  name: z.string().min(2, "Informe o nome completo do contato"),
  channel: z.enum(CHANNEL_OPTIONS),
  phone: z.string().max(32).optional(),
  email: z.union([z.string().email("Informe um e-mail válido"), z.literal("")]),
  tags: z.string().optional(),
  status: z.enum(STATUS_OPTIONS),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const defaultFormValues: ContactFormValues = {
  name: "",
  channel: "whatsapp",
  phone: "",
  email: "",
  tags: "",
  status: "ativo",
};
