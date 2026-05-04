import { NextRequest, NextResponse } from "next/server";
import { runFlowTest } from "@/lib/chatbots";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const flowId = Number(id);
  if (Number.isNaN(flowId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const updated = runFlowTest(flowId);
  if (!updated) {
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
