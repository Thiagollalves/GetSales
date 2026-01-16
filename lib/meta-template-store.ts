import { promises as fs } from "fs";
import path from "path";

export type MetaTemplate = {
    id: string;
    name: string;
    category: string;
    language: string;
    status: string;
    components: Array<{
        type: string;
        text?: string;
        format?: string;
        buttons?: Array<Record<string, unknown>>;
    }>;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_PATH = path.join(DATA_DIR, "meta-templates.json");

async function ensureDataFile() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
        await fs.access(DATA_PATH);
    } catch {
        await fs.writeFile(DATA_PATH, JSON.stringify({ templates: [] }, null, 2));
    }
}

export async function readTemplates(): Promise<MetaTemplate[]> {
    await ensureDataFile();
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { templates?: MetaTemplate[] };
    return parsed.templates ?? [];
}

export async function writeTemplates(templates: MetaTemplate[]) {
    await ensureDataFile();
    await fs.writeFile(DATA_PATH, JSON.stringify({ templates }, null, 2));
}

export async function upsertTemplates(nextTemplates: MetaTemplate[]) {
    const current = await readTemplates();
    const map = new Map<string, MetaTemplate>();
    for (const template of current) {
        map.set(template.id, template);
    }
    for (const template of nextTemplates) {
        map.set(template.id, template);
    }
    await writeTemplates(Array.from(map.values()));
}
