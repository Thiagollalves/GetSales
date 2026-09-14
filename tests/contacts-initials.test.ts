import assert from "node:assert/strict"
import { test } from "node:test"
import { generateContactInitials } from "../lib/contacts.ts"

test("generateContactInitials handles empty or whitespace strings", () => {
  assert.equal(generateContactInitials(""), "?")
  assert.equal(generateContactInitials(" "), "?")
  assert.equal(generateContactInitials("   "), "?")
})

test("generateContactInitials handles single words", () => {
  assert.equal(generateContactInitials("John"), "JO")
  assert.equal(generateContactInitials("J"), "J")
  assert.equal(generateContactInitials("a"), "A")
  assert.equal(generateContactInitials("  John  "), "JO")
})

test("generateContactInitials handles multiple words", () => {
  assert.equal(generateContactInitials("John Doe"), "JD")
  assert.equal(generateContactInitials("John von Doe"), "JD")
  assert.equal(generateContactInitials("john doe"), "JD")
  assert.equal(generateContactInitials("  John   Doe  "), "JD")
})

test("generateContactInitials handles mixed case and special characters", () => {
  assert.equal(generateContactInitials("jOhn dOe"), "JD")
  assert.equal(generateContactInitials("O'Connor"), "O'") // First two chars of a single word
  assert.equal(generateContactInitials("John O'Connor"), "JO") // J and O
  assert.equal(generateContactInitials("María José"), "MJ")
  assert.equal(generateContactInitials("123 456"), "14")
})
