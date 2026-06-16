import assert from "node:assert/strict"
import { test } from "node:test"

import {
  CONTACTS_TOTAL_COUNT,
  buildContactsDetailUrl,
  buildContactsListUrl,
  filterContacts,
  resolveContactDetailState,
  resolveContactsListState,
} from "../lib/contacts.ts"
import { initialConversations } from "../lib/mock-data.ts"

test("contacts workspace keeps the catalog count separate from the visible rows", () => {
  assert.equal(CONTACTS_TOTAL_COUNT, 25036)
})

test("contacts list defaults to a clean query state on the contacts route", () => {
  const state = resolveContactsListState("/dashboard/contacts", new URLSearchParams())

  assert.deepEqual(state, {
    q: "",
    tag: "all",
    owner: "all",
  })
  assert.equal(buildContactsListUrl("/dashboard/contacts", state), "/dashboard/contacts")
})

test("contacts filters match search, tag and owner together", () => {
  const state = resolveContactsListState(
    "/dashboard/contacts",
    new URLSearchParams("q=thiago&tag=VIP&owner=Ana+Souza"),
  )

  const filtered = filterContacts(initialConversations, state)

  assert.equal(filtered.length, 1)
  assert.equal(filtered[0]?.name, "Thiago Alves")
  assert.equal(buildContactsListUrl("/dashboard/contacts", state), "/dashboard/contacts?q=thiago&tag=VIP&owner=Ana+Souza")
})

test("contacts detail defaults to the tickets tab and round-trips a custom tab", () => {
  const defaultState = resolveContactDetailState("/dashboard/contacts/1", new URLSearchParams())
  const engagementState = resolveContactDetailState("/dashboard/contacts/1", new URLSearchParams("tab=engagement"))

  assert.deepEqual(defaultState, { tab: "tickets" })
  assert.deepEqual(engagementState, { tab: "engagement" })
  assert.equal(buildContactsDetailUrl("/dashboard/contacts/1", engagementState), "/dashboard/contacts/1?tab=engagement")
})
