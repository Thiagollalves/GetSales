export interface Message {
    id: number
    content: string
    sender: "contact" | "agent" | "bot"
    time: string
    status?: "sent" | "delivered" | "read"
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
    phone?: string
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
        phone: "5511999999999",
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
