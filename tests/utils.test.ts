import assert from "node:assert/strict"
import { test } from "node:test"
import { cn } from "../lib/utils.ts"

test("cn utility merges normal classes", () => {
  assert.equal(cn("class1", "class2"), "class1 class2")
})

test("cn utility removes redundant tailwind classes", () => {
  assert.equal(cn("p-4", "p-2"), "p-2")
  assert.equal(cn("bg-red-500", "bg-blue-500"), "bg-blue-500")
})

test("cn utility handles conditional classes via clsx", () => {
  assert.equal(cn("base-class", true && "cond-class", false && "never"), "base-class cond-class")
  assert.equal(cn({ "class-a": true, "class-b": false }), "class-a")
})

test("cn utility merges complex combinations", () => {
  assert.equal(cn("text-sm", ["font-bold", "p-1"], { "p-2": true }), "text-sm font-bold p-2")
})
