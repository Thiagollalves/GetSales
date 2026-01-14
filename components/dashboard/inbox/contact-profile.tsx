import type { Conversation } from "@/app/dashboard/inbox/page"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Calendar, Tag, TrendingUp, Edit } from "lucide-react"

interface ContactProfileProps {
  conversation: Conversation
}

export function ContactProfile({ conversation }: ContactProfileProps) {
  return (
    <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
      {/* Profile Header */}
      <div className="text-center pb-4 border-b border-border">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-medium mx-auto">
          {conversation.avatar}
        </div>
        <h3 className="font-semibold mt-3">{conversation.name}</h3>
        <div className="flex justify-center gap-2 mt-2">
          {conversation.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Lead Score */}
      <div className="py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Lead Score
          </span>
          <span className="text-lg font-bold text-primary">{conversation.score}</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${conversation.score}%` }} />
        </div>
      </div>

      {/* Contact Info */}
      <div className="py-4 border-b border-border space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          Informações
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
            <Edit className="h-3 w-3" />
          </Button>
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>+55 11 99999-9999</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>contato@email.com</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>São Paulo, SP</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Cliente desde Jan 2024</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="py-4 border-b border-border">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4" />
          Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {conversation.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
              {tag}
            </span>
          ))}
          <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
            + Adicionar
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="py-4 space-y-2">
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <Phone className="h-4 w-4 mr-2" />
          Ligar
        </Button>
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <Calendar className="h-4 w-4 mr-2" />
          Agendar reunião
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
        >
          Bloquear contato
        </Button>
      </div>
    </div>
  )
}
