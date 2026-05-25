import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Safely merge nested objects presentation and customReport if they are updated
    const updatedPresentation = body.presentation
      ? {
          ...(existingProject.presentation as any || {}),
          ...body.presentation,
        }
      : undefined;

    const updatedCustomReport = body.customReport
      ? {
          ...(existingProject.customReport as any || {}),
          ...body.customReport,
        }
      : undefined;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        clientName: body.clientName !== undefined ? body.clientName : undefined,
        venueName: body.venueName !== undefined ? body.venueName : undefined,
        location: body.location !== undefined ? body.location : undefined,
        type: body.type !== undefined ? body.type : undefined,
        sizeSqM: body.sizeSqM !== undefined ? Number(body.sizeSqM) : undefined,
        seatingCapacity: body.seatingCapacity !== undefined ? Number(body.seatingCapacity) : undefined,
        status: body.status !== undefined ? body.status : undefined,
        budget: body.budget !== undefined ? body.budget : undefined,
        targetAudience: body.targetAudience !== undefined ? body.targetAudience : undefined,
        positioning: body.positioning !== undefined ? body.positioning : undefined,
        goals: body.goals !== undefined ? body.goals : undefined,
        visualDirection: body.visualDirection !== undefined ? body.visualDirection : undefined,
        materials: body.materials !== undefined ? body.materials : undefined,
        focusElements: body.focusElements !== undefined ? body.focusElements : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        password: body.password !== undefined ? body.password : undefined,
        presentation: updatedPresentation,
        customReport: updatedCustomReport,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
