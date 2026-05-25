import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support either an array of projects (migration) or a single project
    if (Array.isArray(body)) {
      const synced = [];
      for (const proj of body) {
        const item = await prisma.project.upsert({
          where: { id: proj.id },
          update: {
            name: proj.name,
            clientName: proj.clientName,
            venueName: proj.venueName || proj.name,
            location: proj.location,
            type: proj.type,
            sizeSqM: proj.sizeSqM || 0,
            seatingCapacity: proj.seatingCapacity || 0,
            status: proj.status,
            budget: proj.budget || "Non specificato",
            targetAudience: proj.targetAudience,
            positioning: proj.positioning,
            goals: proj.goals,
            visualDirection: proj.visualDirection,
            materials: proj.materials,
            focusElements: proj.focusElements,
            notes: proj.notes || "",
            password: proj.password,
            presentation: proj.presentation || null,
            customReport: proj.customReport || null,
          },
          create: {
            id: proj.id,
            name: proj.name,
            clientName: proj.clientName,
            venueName: proj.venueName || proj.name,
            location: proj.location,
            type: proj.type,
            sizeSqM: proj.sizeSqM || 0,
            seatingCapacity: proj.seatingCapacity || 0,
            status: proj.status,
            budget: proj.budget || "Non specificato",
            targetAudience: proj.targetAudience,
            positioning: proj.positioning,
            goals: proj.goals,
            visualDirection: proj.visualDirection,
            materials: proj.materials,
            focusElements: proj.focusElements,
            notes: proj.notes || "",
            password: proj.password,
            presentation: proj.presentation || null,
            customReport: proj.customReport || null,
          },
        });
        synced.push(item);
      }
      return NextResponse.json(synced);
    } else {
      const {
        id,
        name,
        clientName,
        venueName,
        location,
        type,
        sizeSqM,
        seatingCapacity,
        status,
        budget,
        targetAudience,
        positioning,
        goals,
        visualDirection,
        materials,
        focusElements,
        notes,
        password,
        presentation,
        customReport,
      } = body;

      const created = await prisma.project.create({
        data: {
          id,
          name,
          clientName,
          venueName: venueName || name,
          location,
          type,
          sizeSqM: sizeSqM || 0,
          seatingCapacity: seatingCapacity || 0,
          status,
          budget: budget || "Non specificato",
          targetAudience,
          positioning,
          goals,
          visualDirection,
          materials,
          focusElements,
          notes: notes || "",
          password,
          presentation: presentation || null,
          customReport: customReport || null,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
