import assert from "node:assert/strict"
import { test, describe } from "node:test"
import {
  createDefaultPipelineStages,
  normalizePipelineStageId,
  getPipelineStageLabel,
} from "../lib/pipeline-board"

describe("Pipeline Board Core Functions", () => {
  describe("createDefaultPipelineStages", () => {
    test("should return the default pipeline stages", () => {
      const stages = createDefaultPipelineStages()

      assert.equal(stages.length, 5)
      assert.equal(stages[0].id, "novos")
      assert.equal(stages[1].id, "qualificacao")
      assert.equal(stages[2].id, "proposta")
      assert.equal(stages[3].id, "negociacao")
      assert.equal(stages[4].id, "fechamento")
    })

    test("should return cloned objects, not references to the same seed", () => {
      const stages1 = createDefaultPipelineStages()
      const stages2 = createDefaultPipelineStages()

      assert.notEqual(stages1, stages2)
      assert.notEqual(stages1[0], stages2[0])
      assert.notEqual(stages1[0].leads, stages2[0].leads)

      // Mutating one should not affect the other
      stages1[0].leads.push({} as any)
      assert.notEqual(stages1[0].leads.length, stages2[0].leads.length)
    })
  })

  describe("normalizePipelineStageId", () => {
    test("should return null for nullish or empty inputs", () => {
      assert.equal(normalizePipelineStageId(null), null)
      assert.equal(normalizePipelineStageId(undefined), null)
      assert.equal(normalizePipelineStageId(""), null)
      assert.equal(normalizePipelineStageId("   "), null)
    })

    test("should return the exact id when matched", () => {
      assert.equal(normalizePipelineStageId("novos"), "novos")
      assert.equal(normalizePipelineStageId("qualificacao"), "qualificacao")
      assert.equal(normalizePipelineStageId("proposta"), "proposta")
      assert.equal(normalizePipelineStageId("negociacao"), "negociacao")
      assert.equal(normalizePipelineStageId("fechamento"), "fechamento")
    })

    test("should handle surrounding whitespace for exact ids", () => {
      assert.equal(normalizePipelineStageId("  novos  "), "novos")
    })

    test("should match case-insensitively with the label", () => {
      assert.equal(normalizePipelineStageId("Novos Leads"), "novos")
      assert.equal(normalizePipelineStageId("novos leads"), "novos")
      assert.equal(normalizePipelineStageId("PROPOSTA ENVIADA"), "proposta")
    })

    test("should handle surrounding whitespace for labels", () => {
      assert.equal(normalizePipelineStageId("  Novos Leads  "), "novos")
      assert.equal(normalizePipelineStageId("  qualificação  "), "qualificacao")
    })

    test("should return null for unknown values", () => {
      assert.equal(normalizePipelineStageId("unknown"), null)
      assert.equal(normalizePipelineStageId("invalid stage"), null)
    })
  })

  describe("getPipelineStageLabel", () => {
    test("should return empty string for nullish or empty inputs", () => {
      assert.equal(getPipelineStageLabel(null), "")
      assert.equal(getPipelineStageLabel(undefined), "")
      assert.equal(getPipelineStageLabel(""), "")
      assert.equal(getPipelineStageLabel("   "), "")
    })

    test("should return the correct label for a valid id", () => {
      assert.equal(getPipelineStageLabel("novos"), "Novos Leads")
      assert.equal(getPipelineStageLabel("qualificacao"), "Qualificação")
      assert.equal(getPipelineStageLabel("proposta"), "Proposta Enviada")
      assert.equal(getPipelineStageLabel("negociacao"), "Negociação")
      assert.equal(getPipelineStageLabel("fechamento"), "Fechamento")
    })

    test("should return the correctly capitalized label even if input has weird casing", () => {
      assert.equal(getPipelineStageLabel("novos leads"), "Novos Leads")
      assert.equal(getPipelineStageLabel("  proposta enviada  "), "Proposta Enviada")
    })

    test("should return the trimmed fallback string if id is unknown", () => {
      assert.equal(getPipelineStageLabel("unknown"), "unknown")
      assert.equal(getPipelineStageLabel("  some weird stage  "), "some weird stage")
    })
  })
})
