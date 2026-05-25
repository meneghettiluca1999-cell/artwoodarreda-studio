"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, MapPin, Building2, Target, Palette, Loader2, CheckCircle2, Key, Copy, RefreshCw } from "lucide-react";
import { useProjects } from "@/contexts/ProjectContext";

const venueTypes = ["Bar", "Pasticceria", "Gelateria", "Panetteria", "Ristorante", "Pizzeria", "Hamburgheria"];

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getProject, updateProject, regeneratePassword, loading } = useProjects();
  const router = useRouter();
  
  const project = getProject(resolvedParams.id);
  
  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    venueName: "",
    location: "",
    sizeSqM: 0,
    seatingCapacity: 0,
    types: [] as string[],
    status: "new" as "new" | "restyling" | "expansion",
    targetAudience: "",
    positioning: "",
    goals: "",
    visualDirection: "",
    materials: "",
    focusElements: "",
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  // Sync state once project is loaded
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        clientName: project.clientName || "",
        venueName: project.venueName || "",
        location: project.location || "",
        sizeSqM: project.sizeSqM || 0,
        seatingCapacity: project.seatingCapacity || 0,
        types: project.type ? project.type.split(", ").filter(t => t !== "Non specificato") : [],
        status: project.status || "new",
        targetAudience: project.targetAudience || "",
        positioning: project.positioning || "",
        goals: project.goals || "",
        visualDirection: project.visualDirection || "",
        materials: project.materials || "",
        focusElements: project.focusElements || "",
        notes: project.notes || "",
      });
      setCurrentPassword(project.password || "");
    }
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
      </div>
    );
  }

  if (!project) return <div>Progetto non trovato</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handleRegeneratePassword = async () => {
    if (confirm("Sei sicuro? La vecchia password non funzionerà più per il cliente.")) {
      try {
        const newPwd = await regeneratePassword(project.id);
        setCurrentPassword(newPwd);
      } catch (err) {
        alert("Errore durante la rigenerazione della password.");
      }
    }
  };

  const copyPresentationLink = () => {
    const link = `${window.location.origin}/presentation/${project.id}`;
    const text = `Ecco il link alla presentazione del progetto:\n${link}\nPassword di accesso: ${currentPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProject(project.id, {
        name: formData.name || project.name,
        clientName: formData.clientName || project.clientName,
        venueName: formData.venueName || project.venueName,
        location: formData.location || project.location,
        sizeSqM: Number(formData.sizeSqM) || project.sizeSqM,
        seatingCapacity: Number(formData.seatingCapacity) || project.seatingCapacity,
        type: formData.types.length > 0 ? formData.types.join(", ") : project.type,
        status: formData.status,
        targetAudience: formData.targetAudience || project.targetAudience,
        positioning: formData.positioning || project.positioning,
        goals: formData.goals || project.goals,
        visualDirection: formData.visualDirection || project.visualDirection,
        materials: formData.materials || project.materials,
        focusElements: formData.focusElements || project.focusElements,
        notes: formData.notes,
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      alert("Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-foreground">Modifica Progetto</h1>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {project.id}
            </span>
          </div>
          <p className="text-muted-foreground mt-2">Modifica i dati del progetto e del colloquio con il cliente.</p>
        </div>
        <div className="flex items-center gap-3">
          {showSaved && (
            <span className="inline-flex items-center text-sm font-medium text-green-600 animate-in fade-in duration-300">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Salvato!
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow hover:bg-accent/90 transition-colors disabled:opacity-70"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvataggio...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Salva Modifiche</>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Identità del Locale */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-serif mb-6 flex items-center">
            <Building2 className="mr-3 h-5 w-5 text-accent" />
            Identità del Locale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome Progetto</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome Locale</label>
              <input type="text" name="venueName" value={formData.venueName} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />Cliente</label>
              <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Indirizzo e Città</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Grandezza Locale (mq)</label>
              <input type="number" name="sizeSqM" value={formData.sizeSqM || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. 120" min="0" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Posti a sedere previsti</label>
              <input type="number" name="seatingCapacity" value={formData.seatingCapacity || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. 40" min="0" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Tipologia Locale</label>
              <div className="flex flex-wrap gap-2">
                {venueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      formData.types.includes(type)
                        ? 'bg-accent border-accent text-accent-foreground'
                        : 'bg-background border-border text-foreground hover:border-accent/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Stato Progetto</label>
              <div className="flex gap-3">
                {([['new', 'Nuovo'], ['restyling', 'Restyling'], ['expansion', 'Ampliamento']] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFormData(prev => ({ ...prev, status: value }))}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      formData.status === value
                        ? 'bg-accent border-accent text-accent-foreground'
                        : 'bg-background border-border text-foreground hover:border-accent/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Target & Obiettivi */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-serif mb-6 flex items-center">
            <Target className="mr-3 h-5 w-5 text-accent" />
            Target e Obiettivi
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Target Clientela</label>
              <textarea 
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                rows={3} 
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none" 
                placeholder="Descrivi chi frequenterà il locale..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fascia di Posizionamento</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Budget', 'Casual', 'Premium Casual', 'Luxury'].map((pos) => (
                  <div 
                    key={pos} 
                    onClick={() => setFormData(prev => ({ ...prev, positioning: pos }))}
                    className={`border rounded-md p-4 flex items-center justify-center cursor-pointer transition-colors ${
                      formData.positioning === pos 
                        ? 'border-accent bg-accent/10 text-accent' 
                        : 'border-border hover:border-accent/50 hover:bg-accent/5'
                    }`}
                  >
                    <span className="text-sm font-medium">{pos}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Obiettivi di Business</label>
              <textarea 
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows={3} 
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none" 
                placeholder="es. Aumentare coperti serali, creare un format replicabile..."
              />
            </div>
          </div>
        </div>

        {/* Stile & Atmosfera */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-serif mb-6 flex items-center">
            <Palette className="mr-3 h-5 w-5 text-accent" />
            Stile e Atmosfera
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Direzione Visiva</label>
              <textarea 
                name="visualDirection"
                value={formData.visualDirection}
                onChange={handleChange}
                rows={3} 
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none" 
                placeholder="es. Minimalista, industriale, caldo e accogliente..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Materiali Preferiti</label>
                <input type="text" name="materials" value={formData.materials} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. Legno, ottone, cemento..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Elementi da Valorizzare</label>
                <input type="text" name="focusElements" value={formData.focusElements} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. Banco bar, vetrine, ingresso..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Note Interne del Consulente</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4} 
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none" 
                placeholder="Tue osservazioni personali non visibili al cliente..."
              />
            </div>
          </div>
        </div>

        {/* Password & Accesso */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-serif mb-6 flex items-center">
            <Key className="mr-3 h-5 w-5 text-accent" />
            Accesso Presentazione Cliente
          </h2>
          <div className="bg-muted/10 border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-4">
              I clienti hanno bisogno di questa password per accedere all'anteprima della presentazione.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-background border border-border rounded-md px-4 py-3 font-mono text-lg font-bold text-foreground flex-1 w-full text-center sm:text-left tracking-widest">
                {currentPassword}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleRegeneratePassword}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted/10 transition-colors"
                  title="Rigenera Password"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rigenera
                </button>
                <button 
                  onClick={copyPresentationLink}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copiato!" : "Copia Link e Pwd"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-4">
          <Link 
            href="/dashboard" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Torna alla Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href={`/projects/${project.id}/strategic-output`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-muted/10 transition-colors"
            >
              Vai all&apos;Output Strategico →
            </Link>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-70"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvataggio...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Salva</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
