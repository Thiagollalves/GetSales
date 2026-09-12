import assert from "node:assert/strict"
import { test } from "node:test"

import {
  generateContactInitials,
  getContactStatusLabel,
  getContactStatusBadgeVariant,
  cloneContact,
  cloneContacts,
} from "../lib/contacts"
import { initialConversations } from "../lib/mock-data"

test("generateContactInitials", () => {
  // Empty or whitespace
  assert.equal(generateContactInitials(""), "??")
  assert.equal(generateContactInitials("   "), "??")

  // Single word
  assert.equal(generateContactInitials("John"), "JO")
  assert.equal(generateContactInitials("a"), "A")

  // Multiple words
  assert.equal(generateContactInitials("John Doe"), "JD")
  assert.equal(generateContactInitials("John Robert Doe"), "JD")

  // Extra whitespace
  assert.equal(generateContactInitials("  John   Doe  "), "JD")
})

test("getContactStatusLabel", () => {
  assert.equal(getContactStatusLabel("novo"), "Novo Lead")
  assert.equal(getContactStatusLabel("resolvido"), "Resolvido")
  assert.equal(getContactStatusLabel("ativo"), "Ativo")
  // @ts-expect-error test unknown status
  assert.equal(getContactStatusLabel("unknown"), "Ativo")
})

test("getContactStatusBadgeVariant", () => {
  assert.equal(getContactStatusBadgeVariant("novo"), "default")
  assert.equal(getContactStatusBadgeVariant("resolvido"), "outline")
  assert.equal(getContactStatusBadgeVariant("ativo"), "secondary")
  // @ts-expect-error test unknown status
  assert.equal(getContactStatusBadgeVariant("unknown"), "secondary")
})

test("cloneContact deeply clones nested structures", () => {
  const original = initialConversations[0]
  assert.ok(original)

  const cloned = cloneContact(original)

  // Structural equality
  assert.deepEqual(cloned, original)

  // Reference inequality for root
  assert.notEqual(cloned, original)

  // Reference inequality for nested arrays
  assert.notEqual(cloned.tags, original.tags)
  assert.notEqual(cloned.messages, original.messages)

  if (original.internalNotes) {
    assert.notEqual(cloned.internalNotes, original.internalNotes)
    if (original.internalNotes.length > 0 && cloned.internalNotes && cloned.internalNotes.length > 0) {
      assert.notEqual(cloned.internalNotes[0], original.internalNotes[0])
    }
  }

  if (original.customFields) {
    assert.notEqual(cloned.customFields, original.customFields)
  }

  if (original.media) {
    assert.notEqual(cloned.media, original.media)
  }

  if (original.botBindings) {
    assert.notEqual(cloned.botBindings, original.botBindings)
  }

  if (original.timeline) {
    assert.notEqual(cloned.timeline, original.timeline)
  }
})

test("cloneContacts deep clones an array of contacts", () => {
  const originals = [initialConversations[0], initialConversations[1]]
  assert.ok(originals[0] && originals[1])

  const clonedArray = cloneContacts(originals as NonNullable<typeof originals>)

  assert.deepEqual(clonedArray, originals)
  assert.notEqual(clonedArray, originals)

  assert.notEqual(clonedArray[0], originals[0])
  assert.notEqual(clonedArray[1], originals[1])
})
