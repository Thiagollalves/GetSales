export interface Message {
    id: number
    content: string
    sender: "contact" | "agent" | "bot"
    time: string
    status?: "sent" | "delivered" | "read"
    attachment?: Attachment
}

export type Attachment = {
    type: "file" | "image" | "video" | "audio"
    url: string
    name: string
}

export interface LeadCustomField {
    id: number
    label: string
    value: string
}

export interface LeadMediaItem {
    id: number
    type: "image" | "video" | "audio" | "file"
    name: string
    time: string
    group?: "midia" | "audio" | "docs" | "outros"
}

export interface LeadBotBinding {
    id: number
    label: string
    enabled: boolean
    description?: string
}

export interface LeadTimelineItem {
    id: number
    kind: "ticket" | "bloqueio" | "ligacao" | "nota" | "mensagem" | "agendamento" | "fechamento"
    title: string
    description?: string
    time: string
}

export type ConversationPriority = "low" | "medium" | "high"

export interface InternalNote {
    id: number
    content: string
    time: string
}

export interface Conversation {
    id: number
    name: string
    avatar: string
    channel: "whatsapp" | "instagram" | "telegram" | "email" | "webchat"
    lastMessage: string
    time: string
    unread: boolean
    score: number
    tags: string[]
    messages: Message[]
    status: "novo" | "ativo" | "resolvido"
    priority?: ConversationPriority
    pipeline?: string
    assignee?: string
    department?: string
    phone?: string
    email?: string
    location?: string
    customerSince?: string
    nextMeeting?: string
    scheduledAt?: string
    scheduledTime?: string
    scheduledBy?: string
    scheduledMessage?: string
    closedReason?: string
    closedAt?: string
    internalNotes?: InternalNote[]
    customFields?: LeadCustomField[]
    media?: LeadMediaItem[]
    botBindings?: LeadBotBinding[]
    timeline?: LeadTimelineItem[]
}

export interface Template {
    id: string
    name: string
    category: "MARKETING" | "UTILITY" | "AUTHENTICATION"
    language: string
    status: "APPROVED" | "PENDING" | "REJECTED"
    components: {
        type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS"
        text?: string
        format?: string
        buttons?: any[]
    }[]
}

export const initialConversations: Conversation[] = [
    {
        id: 1,
        name: "Thiago Alves",
        avatar: "TA",
        channel: "whatsapp",
        lastMessage: "Gostaria de saber mais sobre o plano Growth...",
        time: "2 min",
        unread: true,
        score: 85,
        tags: ["VIP", "Interessado"],
        status: "ativo",
        priority: "high",
        pipeline: "negociacao",
        assignee: "Ana Souza",
        department: "Comercial",
        phone: "5511999999999",
        email: "contato@email.com",
        location: "São Paulo, SP",
        customerSince: "Jan 2024",
        scheduledAt: "06/05/2026",
        scheduledTime: "10:30",
        scheduledBy: "Ana Souza",
        scheduledMessage: "Confirmar roteiro da reunião e alinhar próximo passo.",
        internalNotes: [
            { id: 1, content: "Explicar a IA na reunião de amanhã e confirmar roteiro.", time: "14:08" },
        ],
        customFields: [
            { id: 1, label: "Origem", value: "Instagram" },
            { id: 2, label: "Plano de interesse", value: "Growth" },
            { id: 3, label: "Responsável comercial", value: "Ana Souza" },
        ],
        media: [
            { id: 1, type: "image", name: "Print do anúncio", time: "Ontem", group: "midia" },
            { id: 2, type: "audio", name: "Áudio de qualificação", time: "Ontem", group: "audio" },
            { id: 3, type: "file", name: "Proposta Growth.pdf", time: "Hoje", group: "docs" },
            { id: 4, type: "video", name: "Vídeo de produto", time: "Hoje", group: "outros" },
        ],
        botBindings: [
            { id: 1, label: "Triagem inicial", enabled: true, description: "Capta intenção e distribui o lead." },
            { id: 2, label: "Retorno automático", enabled: false, description: "Mensagem de ausência e fila." },
        ],
        timeline: [
            {
                id: 1,
                kind: "mensagem",
                title: "Mensagem recebida",
                description: "Quero saber mais sobre os planos disponíveis",
                time: "10:33",
            },
            {
                id: 2,
                kind: "nota",
                title: "Nota interna",
                description: "Explicar a IA na reunião de amanhã e confirmar roteiro.",
                time: "14:08",
            },
            {
                id: 3,
                kind: "agendamento",
                title: "Mensagem agendada",
                description: "Reunião de alinhamento com Thiago Alves.",
                time: "Amanhã",
            },
        ],
        messages: [
            { id: 1, content: "Olá! Vi o anúncio de vocês no Instagram", sender: "contact", time: "10:30" },
            {
                id: 2,
                content: "Olá Thiago! Seja bem-vindo. Como posso ajudar?",
                sender: "agent",
                time: "10:32",
                status: "read",
            },
            { id: 3, content: "Quero saber mais sobre os planos disponíveis", sender: "contact", time: "10:33" },
        ],
    },
    {
        id: 2,
        name: "João Santos",
        avatar: "JS",
        channel: "instagram",
        lastMessage: "O bot respondeu minha dúvida, obrigado!",
        time: "15 min",
        unread: false,
        score: 62,
        tags: ["Lead"],
        status: "ativo",
        priority: "medium",
        pipeline: "novos",
        assignee: "Equipe Bot",
        department: "Automação",
        email: "joao@empresa.com",
        location: "Rio de Janeiro, RJ",
        customerSince: "Fev 2024",
        customFields: [
            { id: 1, label: "Origem", value: "Instagram" },
            { id: 2, label: "Interesse", value: "Integração Shopify" },
        ],
        botBindings: [{ id: 1, label: "Assistente de integração", enabled: true }],
        timeline: [
            {
                id: 1,
                kind: "mensagem",
                title: "O bot respondeu",
                description: "Dúvida sobre Shopify foi resolvida automaticamente.",
                time: "09:15",
            },
        ],
        messages: [
            { id: 1, content: "Oi, vocês fazem integração com Shopify?", sender: "contact", time: "09:15" },
            {
                id: 2,
                content: "Sim! Temos integração nativa com Shopify. Posso te enviar a documentação?",
                sender: "bot",
                time: "09:15",
            },
            { id: 3, content: "O bot respondeu minha dúvida, obrigado!", sender: "contact", time: "09:20" },
        ],
    },
    {
        id: 3,
        name: "Ana Costa",
        avatar: "AC",
        channel: "telegram",
        lastMessage: "Preciso de suporte técnico urgente",
        time: "32 min",
        unread: true,
        score: 78,
        tags: ["Cliente", "Suporte"],
        status: "novo",
        priority: "high",
        pipeline: "qualificacao",
        assignee: "Camila Rocha",
        department: "Suporte",
        email: "ana@empresa.com",
        location: "Curitiba, PR",
        customerSince: "Mar 2024",
        customFields: [
            { id: 1, label: "Urgência", value: "Alta" },
            { id: 2, label: "Canal preferido", value: "Telegram" },
        ],
        media: [{ id: 1, type: "image", name: "Print do erro", time: "Hoje", group: "midia" }],
        timeline: [
            {
                id: 1,
                kind: "ticket",
                title: "Ticket aberto",
                description: "Solicitação técnica com prioridade alta.",
                time: "09:00",
            },
        ],
        messages: [{ id: 1, content: "Preciso de suporte técnico urgente", sender: "contact", time: "09:00" }],
    },
    {
        id: 4,
        name: "Carlos Oliveira",
        avatar: "CO",
        channel: "email",
        lastMessage: "Quando posso agendar uma demonstração?",
        time: "1h",
        unread: false,
        score: 45,
        tags: ["Prospect"],
        status: "ativo",
        priority: "medium",
        pipeline: "proposta",
        assignee: "Time Comercial",
        department: "Comercial",
        email: "carlos@empresa.com",
        location: "Belo Horizonte, MG",
        customerSince: "Abr 2024",
        customFields: [
            { id: 1, label: "Interesse", value: "Demonstração" },
            { id: 2, label: "Budget", value: "R$ 45.000" },
        ],
        botBindings: [{ id: 1, label: "Qualificação automática", enabled: false }],
        timeline: [
            {
                id: 1,
                kind: "ligacao",
                title: "Pedido de demonstração",
                description: "Solicitou agenda para a próxima semana.",
                time: "08:30",
            },
        ],
        messages: [
            { id: 1, content: "Quando posso agendar uma demonstração?", sender: "contact", time: "08:30" },
            {
                id: 2,
                content: "Olá Carlos! Temos horários disponíveis amanhã às 10h ou 15h. Qual prefere?",
                sender: "agent",
                time: "08:45",
                status: "delivered",
            },
        ],
    },
    {
        id: 5,
        name: "Fernanda Lima",
        avatar: "FL",
        channel: "webchat",
        lastMessage: "Vocês têm trial gratuito?",
        time: "2h",
        unread: false,
        score: 55,
        tags: ["Lead"],
        status: "resolvido",
        priority: "low",
        pipeline: "fechamento",
        assignee: "Equipe Bot",
        email: "fernanda@empresa.com",
        location: "Recife, PE",
        customerSince: "Mai 2024",
        customFields: [{ id: 1, label: "Plano", value: "Trial" }],
        botBindings: [{ id: 1, label: "Follow-up trial", enabled: true }],
        timeline: [
            {
                id: 1,
                kind: "mensagem",
                title: "Pergunta sobre trial",
                description: "Verificou se há teste gratuito disponível.",
                time: "07:30",
            },
        ],
        messages: [
            { id: 1, content: "Vocês têm trial gratuito?", sender: "contact", time: "07:30" },
            { id: 2, content: "Sim! Oferecemos 14 dias de teste gratuito.", sender: "bot", time: "07:30" },
        ],
    },
]

export const initialTemplates: Template[] = [
    {
        id: "1",
        name: "hello_world",
        category: "UTILITY",
        language: "en_US",
        status: "APPROVED",
        components: [
            { type: "BODY", text: "Hello World" },
            { type: "FOOTER", text: "Meta Graph API" }
        ]
    },
    {
        id: "2",
        name: "promocao_janeiro",
        category: "MARKETING",
        language: "pt_BR",
        status: "APPROVED",
        components: [
            { type: "HEADER", format: "IMAGE" },
            { type: "BODY", text: "Olá {{1}}, aproveite nossas ofertas de janeiro com descontos de até {{2}}%!" },
            { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "Eu quero!" }] }
        ]
    }
]
