import assert from "node:assert/strict"
import { test } from "node:test"

import { buildFlowTestOutcome } from "../lib/chatbots-core.ts"

test("flow test outcome is deterministic", () => {
  const outcome = buildFlowTestOutcome(2)

  assert.equal(outcome.score, 86)
  assert.equal(outcome.status, "Excelente")
  assert.deepEqual(buildFlowTestOutcome(2), outcome)
})
