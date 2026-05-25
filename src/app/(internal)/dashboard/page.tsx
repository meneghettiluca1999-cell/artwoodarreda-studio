"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/contexts/ProjectContext";
import { PlusCircle, ArrowRight, Building2, Calendar, MapPin, MoreVertical, Pencil, Trash2, X, AlertTriangle, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { projects, deleteProject, loading } = useProjects();
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
    } catch (e) {
      alert("Errore durante l'eliminazione del progetto.");
    } finally {
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    }
  };

  const projectToDelete = deleteConfirmId ? projects.find(p => p.id === deleteConfirmId) : null;


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Benvenuto in Artwoodarreda Studio. Gestisci i tuoi progetti qui.</p>
        </div>
        <Link 
          href="/projects/new"
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow hover:bg-accent/90 transition-colors"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuovo Progetto
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Progetti Attivi</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card border border-border rounded-xl shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-accent" />
            <p>Caricamento dei progetti in corso...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group relative rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-accent/50">
              {/* Action Menu Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === project.id ? null : project.id);
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Azioni progetto"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === project.id && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card shadow-lg z-30 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          router.push(`/projects/${project.id}/strategic-output`);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/10 transition-colors"
                      >
                        <ArrowRight className="mr-3 h-4 w-4 text-muted-foreground" />
                        Visualizza Progetto
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          router.push(`/projects/${project.id}/edit`);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/10 transition-colors"
                      >
                        <Pencil className="mr-3 h-4 w-4 text-muted-foreground" />
                        Modifica Progetto
                      </button>
                      <div className="my-1 border-t border-border" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          setDeleteConfirmId(project.id);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Elimina Progetto
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Card Content (Clickable) */}
              <Link href={`/projects/${project.id}/strategic-output`} className="block">
                <div className="flex justify-between items-start mb-4 pr-8">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{project.clientName}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {project.status === 'new' ? 'Nuovo' : project.status === 'restyling' ? 'Restyling' : 'Ampliamento'}
                  </span>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="mr-2 h-4 w-4" />
                    {project.type}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {project.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Aggiornato oggi
                  </div>
                </div>

                <div className="mt-6 flex items-center text-sm font-medium text-accent">
                  Apri progetto
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </div>
          ))}
          
            <Link href="/projects/new">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-accent hover:bg-accent/5 transition-colors h-full min-h-[220px]">
                <PlusCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <span className="mt-2 block text-sm font-medium text-foreground">Aggiungi nuovo</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mx-auto mb-6">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>

            <h3 className="text-xl font-serif text-center mb-2">Eliminare questo progetto?</h3>
            <p className="text-muted-foreground text-center text-sm mb-8">
              Stai per eliminare <strong className="text-foreground">&ldquo;{projectToDelete.name}&rdquo;</strong> di {projectToDelete.clientName}. 
              Questa azione è irreversibile e tutti i dati del progetto andranno persi.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-3 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted/10 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-3 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
              >
                <Trash2 className="inline mr-2 h-4 w-4" />
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
