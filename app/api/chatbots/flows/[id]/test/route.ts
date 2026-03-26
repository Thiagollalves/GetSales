import { NextResponse } from "next/server";
import { runFlowTest } from "@/lib/chatbots";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const updated = runFlowTest(id);
  if (!updated) {
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
