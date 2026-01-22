import { promises as fs } from "fs";
import os from "os";
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

const DEFAULT_DATA_DIR = path.join(os.tmpdir(), "getsales-data");
const DATA_DIR = process.env.META_TEMPLATE_STORE_DIR ?? DEFAULT_DATA_DIR;
const DATA_PATH = path.join(DATA_DIR, "meta-templates.json");
let memoryTemplates: MetaTemplate[] | null = null;

async function ensureDataFile() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
        await fs.access(DATA_PATH);
    } catch {
        await fs.writeFile(DATA_PATH, JSON.stringify({ templates: [] }, null, 2));
    }
}

export async function readTemplates(): Promise<MetaTemplate[]> {
    try {
        await ensureDataFile();
        const raw = await fs.readFile(DATA_PATH, "utf-8");
        const parsed = JSON.parse(raw) as { templates?: MetaTemplate[] };
        return parsed.templates ?? [];
    } catch {
        if (memoryTemplates) {
            return memoryTemplates;
        }
        await writeTemplates([]);
        return memoryTemplates ?? [];
    }
}

export async function writeTemplates(templates: MetaTemplate[]) {
    try {
        await ensureDataFile();
        const nextContents = JSON.stringify({ templates }, null, 2);
        const tempPath = `${DATA_PATH}.tmp`;
        await fs.writeFile(tempPath, nextContents);
        await fs.rename(tempPath, DATA_PATH);
        memoryTemplates = null;
    } catch {
        memoryTemplates = templates;
    }
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
