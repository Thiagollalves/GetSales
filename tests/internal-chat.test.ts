import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { createLeadContextConversation, CURRENT_INTERNAL_USER_ID, InternalLeadContextInput } from "../lib/internal-chat"

describe("createLeadContextConversation", () => {
  it("generates a conversation with only mandatory inputs and default assignee fallback", () => {
    const input: InternalLeadContextInput = {
      leadId: 105,
      leadName: "João Silva",
    }

    const conversation = createLeadContextConversation(input)

    assert.equal(conversation.name, "Lead • João Silva")
    assert.equal(conversation.description, "Discussão interna sobre João Silva")
    assert.equal(conversation.avatar, "L•")
    assert.deepEqual(conversation.memberIds, [CURRENT_INTERNAL_USER_ID, 2])
    assert.equal(conversation.relatedLeadId, "105")
    assert.equal(conversation.relatedLeadName, "João Silva")
    assert.equal(conversation.relatedLeadChannel, undefined)
    assert.equal(conversation.relatedLeadAssignee, undefined)
    assert.equal(conversation.relatedLeadPipeline, undefined)
    assert.deepEqual(conversation.typingMemberIds, [2])
    assert.equal(conversation.messages.length, 2)
    assert.equal(conversation.messages[0].authorId, CURRENT_INTERNAL_USER_ID)
    assert.equal(conversation.messages[1].authorId, 2)
  })

  it("generates a conversation with optional inputs and matched assignee", () => {
    const input: InternalLeadContextInput = {
      leadId: "lead-200",
      leadName: "Maria Eduarda",
      leadChannel: "whatsapp",
      leadAssignee: "Marcos Vann",
      leadPipeline: "Qualificação",
    }

    const conversation = createLeadContextConversation(input)

    assert.equal(conversation.relatedLeadId, "lead-200")
    assert.equal(conversation.relatedLeadName, "Maria Eduarda")
    assert.equal(conversation.relatedLeadChannel, "whatsapp")
    assert.equal(conversation.relatedLeadAssignee, "Marcos Vann")
    assert.equal(conversation.relatedLeadPipeline, "Qualificação")
    // Marcos Vann is id 3
    assert.deepEqual(conversation.memberIds, [CURRENT_INTERNAL_USER_ID, 3])
    assert.deepEqual(conversation.typingMemberIds, [3])
    assert.equal(conversation.messages[1].authorId, 3)
  })

  it("generates a conversation falling back to default assignee if provided assignee is not found", () => {
    const input: InternalLeadContextInput = {
      leadId: 300,
      leadName: "Carlos Pereira",
      leadAssignee: "Não Existe",
    }

    const conversation = createLeadContextConversation(input)

    assert.equal(conversation.relatedLeadAssignee, "Não Existe")
    assert.deepEqual(conversation.memberIds, [CURRENT_INTERNAL_USER_ID, 2])
    assert.deepEqual(conversation.typingMemberIds, [2])
    assert.equal(conversation.messages[1].authorId, 2)
  })
})
