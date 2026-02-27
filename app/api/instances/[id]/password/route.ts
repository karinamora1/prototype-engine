import { NextRequest, NextResponse } from "next/server";
import { removePassword } from "@/lib/instance-store";

/**
 * DELETE /api/instances/[id]/password
 * Removes password protection from an instance.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await removePassword(id);
    if (!updated) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Remove password error:", e);
    return NextResponse.json({ error: "Failed to remove password" }, { status: 500 });
  }
}
