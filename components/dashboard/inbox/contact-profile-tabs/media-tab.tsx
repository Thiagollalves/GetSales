"use client"

import { useMemo, useState } from "react"
import { FileText, ImageIcon, Music2, Video } from "lucide-react"
import type { Conversation, LeadMediaItem } from "@/lib/mock-data"

const mediaFilters = [
  { id: "midia", label: "Mídia" },
  { id: "audio", label: "Áudio" },
  { id: "docs", label: "Docs" },
  { id: "outros", label: "Outros" },
] as const

function normalizeMediaGroup(group?: LeadMediaItem["group"]) {
  return group ?? "midia"
}

function getMediaIcon(type: LeadMediaItem["type"]) {
  switch (type) {
    case "audio":
      return Music2
    case "video":
      return Video
    case "file":
      return FileText
    default:
      return ImageIcon
  }
}

interface MediaTabProps {
  conversation: Conversation
}

export function MediaTab({ conversation }: MediaTabProps) {
  const [mediaFilter, setMediaFilter] = useState<(typeof mediaFilters)[number]["id"]>("midia")

  const mediaItems = useMemo(() => {
    const items = [...(conversation.media ?? [])]
    return items.sort((left, right) => left.time.localeCompare(right.time))
  }, [conversation.media])

  const filteredMedia = mediaItems.filter((item) => normalizeMediaGroup(item.group) === mediaFilter)

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Mídia</p>
            <h4 className="text-sm font-semibold text-foreground">{mediaItems.length} itens anexados</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {mediaFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setMediaFilter(filter.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  mediaFilter === filter.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredMedia.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredMedia.map((item) => {
              const Icon = getMediaIcon(item.type)
              return (
                <div key={item.id} className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[20px] border border-dashed border-border/70 bg-background/60 p-6 text-center">
            <p className="text-sm font-medium text-foreground">Sem itens nessa categoria</p>
            <p className="mt-1 text-sm text-muted-foreground">A mídia do contato aparece aqui quando houver anexos.</p>
          </div>
        )}
      </section>
    </div>
  )
}
