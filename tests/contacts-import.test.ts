import assert from "node:assert/strict"
import { test } from "node:test"

import { parseContactsFromCsv, parseContactsFromRows } from "../lib/contacts-import.ts"

test("maps JetSales spreadsheet headers into contact fields", () => {
  const contacts = parseContactsFromRows(
    [
      [
        "Nome completo do cliente",
        "Número",
        "E-mail",
        "Tags",
        "Lead Status",
        "Responsável comercial",
        "Departamento",
        "Última mensagem",
        "Horário",
        "Canal",
        "Observações extras",
      ],
      [
        "Maria Lima",
        "5511999999999",
        "maria@jetsales.com.br",
        "JetSales;VIP",
        "Novo",
        "Ana Souza",
        "Comercial",
        "Quero saber mais sobre o plano",
        "09:15",
        "Instagram",
        "Campo ignorado",
      ],
    ],
    (() => {
      let nextId = 10
      return () => nextId++
    })(),
  )

  assert.equal(contacts.length, 1)
  assert.deepEqual(contacts[0], {
    id: 10,
    name: "Maria Lima",
    avatar: "ML",
    channel: "instagram",
    lastMessage: "Quero saber mais sobre o plano",
    time: "09:15",
    unread: true,
    score: 50,
    tags: ["JetSales", "VIP"],
    status: "novo",
    messages: [],
    phone: "5511999999999",
    email: "maria@jetsales.com.br",
    assignee: "Ana Souza",
    department: "Comercial",
  })
})

test("defaults the imported channel to whatsapp when the sheet omits it", () => {
  const contacts = parseContactsFromRows(
    [
      ["Nome", "Número", "Tags", "Lead Status"],
      ["João Pereira", "551188887777", "Prospect", "Ativo"],
    ],
    (() => {
      let nextId = 1
      return () => nextId++
    })(),
  )

  assert.equal(contacts.length, 1)
  assert.equal(contacts[0].channel, "whatsapp")
  assert.equal(contacts[0].status, "ativo")
})

test("parses the CSV fallback with the same JetSales header mapping", () => {
  const contacts = parseContactsFromCsv(
    [
      "Nome completo do cliente,Número,Tags,Lead Status,Responsável comercial",
      "Carla Mendes,551177776666,JetSales;Growth,Resolvido,Equipe SDR",
    ].join("\n"),
    (() => {
      let nextId = 42
      return () => nextId++
    })(),
  )

  assert.equal(contacts.length, 1)
  assert.equal(contacts[0].id, 42)
  assert.equal(contacts[0].name, "Carla Mendes")
  assert.equal(contacts[0].status, "resolvido")
  assert.equal(contacts[0].assignee, "Equipe SDR")
  assert.deepEqual(contacts[0].tags, ["JetSales", "Growth"])
})
