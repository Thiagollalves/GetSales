import { NextResponse } from "next/server";
import { readTemplates, upsertTemplates, writeTemplates, type MetaTemplate } from "@/lib/meta-template-store";

const GRAPH_VERSION = "v20.0";

function normalizeTemplate(template: MetaTemplate) {
    return {
        id: template.id,
        name: template.name,
        category: template.category,
        language: template.language,
        status: template.status,
        components: template.components,
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const shouldRefresh = searchParams.get("refresh") === "1";
    const token = request.headers.get("x-wh-token");
    const wabaId = request.headers.get("x-wh-waba-id");

    if (shouldRefresh) {
        if (!token || !wabaId) {
            return NextResponse.json(
                { error: "Missing required headers: x-wh-token, x-wh-waba-id" },
                { status: 400 }
            );
        }

        const url = `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/message_templates?fields=name,status,category,language,components`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(
                { error: data.error?.message || "Failed to fetch templates from Meta." },
                { status: response.status }
            );
        }

        const templates = (data.data ?? []).map((template: MetaTemplate) => normalizeTemplate(template));
        await writeTemplates(templates);
        return NextResponse.json({ templates });
    }

    const templates = await readTemplates();
    return NextResponse.json({ templates });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, category, language, components, token, wabaId } = body;

        if (!name || !category || !language || !components || !token || !wabaId) {
            return NextResponse.json(
                { error: "Missing required fields: name, category, language, components, token, wabaId" },
                { status: 400 }
            );
        }

        const url = `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/message_templates`;
        const payload = {
            name,
            category,
            language,
            components,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(
                { error: data.error?.message || "Failed to create template." },
                { status: response.status }
            );
        }

        const template: MetaTemplate = {
            id: data.id ?? crypto.randomUUID(),
            name,
            category,
            language,
            status: data.status ?? "PENDING",
            components,
        };

        await upsertTemplates([template]);
        return NextResponse.json({ template });
    } catch (error) {
        console.error("Error creating WhatsApp template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
