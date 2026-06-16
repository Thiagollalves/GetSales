import type { Conversation } from "@/lib/mock-data"

export interface CampaignTagOption {
  value: string
  label: string
  count: number
}

function normalizeCampaignText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function buildCampaignTagOptions(contacts: Conversation[]): CampaignTagOption[] {
  const tagCounts = new Map<string, { label: string; count: number }>()

  contacts.forEach((contact) => {
    contact.tags.forEach((tag) => {
      const trimmed = tag.trim()
      if (!trimmed) {
        return
      }

      const normalized = normalizeCampaignText(trimmed)
      const current = tagCounts.get(normalized)
      if (current) {
        current.count += 1
        return
      }

      tagCounts.set(normalized, { label: trimmed, count: 1 })
    })
  })

  return [
    { value: "all", label: "Todos os Contatos", count: contacts.length },
    ...Array.from(tagCounts.entries())
      .sort((left, right) => left[1].label.localeCompare(right[1].label, "pt-BR", { sensitivity: "base" }))
      .map(([, entry]) => ({
        value: entry.label,
        label: entry.label,
        count: entry.count,
      })),
  ]
}

export function selectCampaignAudience(contacts: Conversation[], selectedTag: string) {
  if (selectedTag === "all") {
    return contacts
  }

  const normalizedSelectedTag = normalizeCampaignText(selectedTag)
  return contacts.filter((contact) =>
    contact.tags.some((tag) => normalizeCampaignText(tag) === normalizedSelectedTag),
  )
}
