import { NextResponse } from "next/server";
import { AgentStatus, createAgent, listAgents } from "@/lib/chatbots";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";

const allowedStatuses: AgentStatus[] = ["Ativo", "Em teste", "Pausado"];

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(listAgents());
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const { name, channel, focus, status } = body;
  if (!name || !channel || !focus || !status) {
    return NextResponse.json(
      { error: "Campos obrigatórios: name, channel, focus e status" },
      { status: 400 },
    );
  }

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Status inválido. Opções válidas: ${allowedStatuses.join(", ")}` },
      { status: 400 },
    );
  }

  const agent = createAgent({
    name: name.toString().trim(),
    channel: channel.toString().trim(),
    focus: focus.toString().trim(),
    status,
  });

  return NextResponse.json(agent, { status: 201 });
}
