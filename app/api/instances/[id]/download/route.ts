import { NextRequest, NextResponse } from "next/server";
import { getInstance } from "@/lib/instance-store";
import fs from "fs/promises";
import path from "path";
import archiver from "archiver";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "project";
}

/**
 * GET /api/instances/[id]/download
 * Builds a zip containing a full Next.js project that runs this instance
 * standalone (npm install && npm run dev).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const instance = await getInstance(id);
    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    const { passwordHash, ...instanceData } = instance;
    const projectName = slugify(instance.name) || "prototype";
    const cwd = process.cwd();

    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));

    const finished = new Promise<void>((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    // Template files (standalone app)
    const templateDir = path.join(cwd, "templates", "standalone");
    const templateFiles = [
      "package.json",
      "next.config.js",
      "tsconfig.json",
      "tailwind.config.ts",
      "postcss.config.js",
      "README.md",
      "app/layout.tsx",
      "app/globals.css",
      "app/page.tsx",
    ];
    for (const file of templateFiles) {
      const fullPath = path.join(templateDir, file);
      const content = await fs.readFile(fullPath, "utf-8");
      archive.append(content, { name: file });
    }

    // Instance data as public/instance.json (page fetches /instance.json)
    archive.append(JSON.stringify(instanceData, null, 2), {
      name: "public/instance.json",
    });

    // Project files required by BasePrototype
    const projectFiles = [
      "components/BasePrototype.tsx",
      "lib/types.ts",
      "lib/content-editor-utils.ts",
      "lib/image-compress.ts",
    ];
    for (const file of projectFiles) {
      const fullPath = path.join(cwd, file);
      const content = await fs.readFile(fullPath, "utf-8");
      archive.append(content, { name: file });
    }

    archive.finalize();
    await finished;

    const zipBuffer = Buffer.concat(chunks);
    const filename = `${projectName}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    console.error("Download project zip error:", e);
    return NextResponse.json(
      { error: "Failed to build project download" },
      { status: 500 }
    );
  }
}
