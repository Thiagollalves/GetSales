import { NextResponse } from "next/server";
import { createFlow, listFlows, updateFlow } from "@/lib/chatbots";

export async function GET() {
  const flows = listFlows();
  return NextResponse.json(flows);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const { name, trigger, conversations, active } = body;
  if (!name || !trigger || typeof conversations !== "number" || typeof active !== "boolean") {
    return NextResponse.json(
      { error: "Campos obrigatórios: name (string), trigger (string), conversations (number), active (boolean)" },
      { status: 400 },
    );
  }

  const flow = createFlow({
    name: name.toString().trim(),
    trigger: trigger.toString().trim(),
    conversations: Math.max(0, conversations),
    active,
  });

  return NextResponse.json(flow, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const { id, active } = body;
  if (typeof id !== "number" || typeof active !== "boolean") {
    return NextResponse.json(
      { error: "Campos obrigatórios: id (number) e active (boolean)" },
      { status: 400 },
    );
  }

  const updated = updateFlow(id, { active });
  if (!updated) {
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
