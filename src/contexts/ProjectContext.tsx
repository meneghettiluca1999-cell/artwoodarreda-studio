"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { mockProjects, Project, generatePassword } from "@/lib/mock-data";

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  addProject: (projectData: Omit<Project, 'id' | 'presentation' | 'password'>) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  regeneratePassword: (id: string) => Promise<string>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        // 1. Fetch from SQLite database
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        let dbProjects = await res.json();

        // 2. Check for local storage projects to migrate/sync
        const stored = localStorage.getItem("artwood_projects");
        if (stored) {
          try {
            const localProjects = JSON.parse(stored) as Project[];
            if (localProjects.length > 0) {
              const syncRes = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localProjects),
              });
              if (syncRes.ok) {
                // Successfully migrated local storage projects, clear local storage
                localStorage.removeItem("artwood_projects");
                // Refetch projects from database to get the updated list
                const refreshedRes = await fetch("/api/projects");
                if (refreshedRes.ok) {
                  dbProjects = await refreshedRes.json();
                }
              }
            }
          } catch (err) {
            console.error("Error migrating local projects:", err);
          }
        }

        // 3. Seed database with mockProjects if empty
        if (dbProjects.length === 0) {
          const syncRes = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mockProjects),
          });
          if (syncRes.ok) {
            dbProjects = await syncRes.json();
          } else {
            dbProjects = mockProjects;
          }
        }

        setProjects(dbProjects);
      } catch (err) {
        console.error("Error loading database projects:", err);
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const updateProject = async (id: string, data: Partial<Project>) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update project");
    }

    const updated = await res.json();
    setProjects(prev => prev.map(p => (p.id === id ? updated : p)));
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'presentation' | 'password'>) => {
    const newId = `P-${Math.floor(Math.random() * 9000) + 1000}`;
    const newPassword = generatePassword(6);

    const newProject: Project = {
      ...projectData,
      id: newId,
      sizeSqM: projectData.sizeSqM || 0,
      seatingCapacity: projectData.seatingCapacity || 0,
      password: newPassword,
      presentation: {
        heroImage: "/generated/hero_default.webp",
        conceptText: "Concept generato automaticamente in base alle tue selezioni.",
        vision: {
          atmosphere: projectData.visualDirection || "Accogliente e Moderna",
          direction: "Contemporary",
          goals: []
        },
        planimetryImage: "/generated/planimetry_default.webp",
        moodboardImages: [
          { url: "/generated/moodboard_1.webp", tag: "Materiali" },
          { url: "/generated/moodboard_2.webp", tag: "Arredo" },
          { url: "/generated/moodboard_3.webp", tag: "Illuminazione" },
          { url: "/generated/moodboard_4.webp", tag: "Dettagli" },
        ],
        inspirations: [
          { url: "/generated/inspiration_1.webp", caption: "Atmosfera serale", relevance: "Riferimento per l'ambiente." },
          { url: "/generated/inspiration_2.webp", caption: "Design d'interni", relevance: "Ispirazione per il layout." },
        ],
        focusAreas: [
          { title: "Zona Principale", description: "L'area centrale del locale, fulcro dell'esperienza.", imageUrl: "/generated/focus_bar.webp" },
          { title: "Illuminazione", description: "Sistemi di luce integrati per creare l'atmosfera desiderata.", imageUrl: "/generated/focus_lighting.webp" },
        ],
        proposal: {
          totalEstimate: "In definizione",
          timeline: "In definizione"
        }
      }
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });

    if (!res.ok) {
      throw new Error("Failed to create project");
    }

    const created = await res.json();
    setProjects(prev => [created, ...prev]);
    return newId;
  };

  const deleteProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete project");
    }

    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const regeneratePassword = async (id: string) => {
    const res = await fetch(`/api/projects/${id}/password`, {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("Failed to regenerate password");
    }

    const { password } = await res.json();
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, password };
      }
      return p;
    }));
    return password;
  };

  const getProject = (id: string) => {
    return projects.find(p => p.id === id) || mockProjects.find(p => p.id === id);
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, updateProject, addProject, deleteProject, getProject, regeneratePassword }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
