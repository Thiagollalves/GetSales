"use client"

import { useState } from "react"
import { AutomationList } from "@/components/dashboard/automation/automation-list"
import { AutomationBuilder } from "@/components/dashboard/automation/automation-builder"
import type { Automation } from "@/components/dashboard/automation/types"

const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Follow-up lead inativo",
    description: "Envia WhatsApp para leads sem interação há 3 dias",
    status: "active",
    trigger: "inactivity",
    runs: 1247,
    lastRun: "Há 5 min",
    nodes: [
      {
        id: "trigger",
        type: "trigger",
        data: { label: "Lead inativo há 3 dias", icon: "clock" },
        position: { x: 100, y: 50 },
      },
      {
        id: "condition1",
        type: "condition",
        data: { label: "Score > 50?", icon: "filter" },
        position: { x: 100, y: 150 },
      },
      {
        id: "action1",
        type: "action",
        data: { label: "Enviar WhatsApp", icon: "message" },
        position: { x: 100, y: 250 },
      },
      { id: "action2", type: "action", data: { label: "Atualizar status", icon: "tag" }, position: { x: 100, y: 350 } },
    ],
  },
  {
    id: "2",
    name: "Boas-vindas novo lead",
    description: "Sequência automática para novos cadastros",
    status: "active",
    trigger: "form_submit",
    runs: 856,
    lastRun: "Há 15 min",
    nodes: [
      {
        id: "trigger",
        type: "trigger",
        data: { label: "Formulário enviado", icon: "form" },
        position: { x: 100, y: 50 },
      },
      {
        id: "action1",
        type: "action",
        data: { label: "Criar lead no funil", icon: "user-plus" },
        position: { x: 100, y: 150 },
      },
      { id: "action2", type: "action", data: { label: "Enviar e-mail", icon: "mail" }, position: { x: 100, y: 250 } },
      { id: "delay1", type: "delay", data: { label: "Aguardar 24h", icon: "clock" }, position: { x: 100, y: 350 } },
      {
        id: "action3",
        type: "action",
        data: { label: "Enviar WhatsApp", icon: "message" },
        position: { x: 100, y: 450 },
      },
    ],
  },
  {
    id: "3",
    name: "Qualificação automática",
    description: "Atualiza score e etapa baseado em engajamento",
    status: "paused",
    trigger: "engagement",
    runs: 2341,
    lastRun: "Há 2h",
    nodes: [
      { id: "trigger", type: "trigger", data: { label: "E-mail aberto", icon: "mail" }, position: { x: 100, y: 50 } },
      {
        id: "action1",
        type: "action",
        data: { label: "Aumentar score +10", icon: "trending-up" },
        position: { x: 100, y: 150 },
      },
      {
        id: "condition1",
        type: "condition",
        data: { label: "Score > 70?", icon: "filter" },
        position: { x: 100, y: 250 },
      },
      {
        id: "action2",
        type: "action",
        data: { label: "Mover para Qualificação", icon: "git-branch" },
        position: { x: 100, y: 350 },
      },
    ],
  },
]

export default function AutomationPage() {
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  if (selectedAutomation || isCreating) {
    return (
      <AutomationBuilder
        automation={selectedAutomation}
        onBack={() => {
          setSelectedAutomation(null)
          setIsCreating(false)
        }}
      />
    )
  }

  return (
    <AutomationList
      automations={mockAutomations}
      onSelect={setSelectedAutomation}
      onCreate={() => setIsCreating(true)}
    />
  )
}
