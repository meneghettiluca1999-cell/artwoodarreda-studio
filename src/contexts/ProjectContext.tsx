"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { mockProjects, Project, generatePassword } from "@/lib/mock-data";

interface ProjectContextType {
  projects: Project[];
  updateProject: (id: string, data: Partial<Project>) => void;
  addProject: (projectData: Omit<Project, 'id' | 'presentation' | 'password'>) => string;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  regeneratePassword: (id: string) => string;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("artwood_projects");
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        setProjects(mockProjects);
      }
    } else {
      setProjects(mockProjects);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("artwood_projects", JSON.stringify(projects));
    }
  }, [projects]);

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...data };
        if (data.presentation) {
          updated.presentation = { ...p.presentation, ...data.presentation } as any;
        }
        return updated as Project;
      }
      return p;
    }));
  };

  const addProject = (projectData: Omit<Project, 'id' | 'presentation' | 'password'>) => {
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
    
    setProjects(prev => [newProject, ...prev]);
    return newId;
  };

  const deleteProject = (id: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (updated.length === 0) {
        localStorage.removeItem("artwood_projects");
      }
      return updated;
    });
  };

  const regeneratePassword = (id: string) => {
    const newPassword = generatePassword(6);
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, password: newPassword };
      }
      return p;
    }));
    return newPassword;
  };

  const getProject = (id: string) => {
    return projects.find(p => p.id === id) || mockProjects.find(p => p.id === id);
  };

  return (
    <ProjectContext.Provider value={{ projects, updateProject, addProject, deleteProject, getProject, regeneratePassword }}>
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
