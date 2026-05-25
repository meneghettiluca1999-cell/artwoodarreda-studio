import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePassword } from "@/lib/mock-data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newPassword = generatePassword(6);

    await prisma.project.update({
      where: { id },
      data: {
        password: newPassword,
      },
    });

    return NextResponse.json({ password: newPassword });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
