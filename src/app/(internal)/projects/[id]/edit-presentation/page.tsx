"use client";

import { useState, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, FileText, CheckCircle2, LayoutTemplate, Lightbulb, Plus, Trash2, GripVertical, Check, Upload, Loader2, Share2 } from "lucide-react";
import { useProjects } from "@/contexts/ProjectContext";
import Image from "next/image";

/** Resizes and compresses an image file to Base64 to fit LocalStorage limits */
const resizeAndCompressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 1200; // max width/height

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
        } else {
          reject(new Error("Errore durante la creazione del context 2D"));
        }
      };
      img.onerror = () => reject(new Error("Errore durante il caricamento dell'immagine"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Errore durante la lettura del file"));
    reader.readAsDataURL(file);
  });
};

export default function EditPresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getProject, updateProject } = useProjects();
  const router = useRouter();
  
  const project = getProject(resolvedParams.id);
  
  const [formData, setFormData] = useState({
    heroImage: project?.presentation?.heroImage || "/generated/hero_default.webp",
    conceptText: project?.presentation?.conceptText || "",
    visionAtmosphere: project?.presentation?.vision.atmosphere || "",
    visionDirection: project?.presentation?.vision.direction || "",
    visionGoals: project?.presentation?.vision.goals || [],
    planimetryImage: project?.presentation?.planimetryImage || "/generated/planimetry_default.webp",
    moodboardImages: project?.presentation?.moodboardImages || [],
    inspirations: project?.presentation?.inspirations || [],
    focusAreas: project?.presentation?.focusAreas || [],
    totalEstimate: project?.presentation?.proposal.totalEstimate || "",
    timeline: project?.presentation?.proposal.timeline || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!project) return <div>Progetto non trovato</div>;

  const copyPresentationLink = () => {
    const link = `${window.location.origin}/presentation/${project.id}`;
    const text = `Ecco il link alla presentazione del progetto "${project.name}":\n${link}\n\nPassword di accesso: ${project.password || "artwood"}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generic handlers for arrays
  const handleArrayChange = (field: string, index: number, key: string, value: string) => {
    setFormData(prev => {
      const newArray = [...(prev as any)[field]];
      newArray[index] = { ...newArray[index], [key]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: string, defaultItem: any) => {
    setFormData(prev => ({ ...prev, [field]: [...(prev as any)[field], defaultItem] }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const newArray = [...(prev as any)[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleStringArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...(prev as any)[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addStringArrayItem = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: [...(prev as any)[field], value] }));
  };

  const removeStringArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const newArray = [...(prev as any)[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    
    updateProject(project.id, {
      presentation: {
        heroImage: formData.heroImage,
        conceptText: formData.conceptText,
        vision: {
          atmosphere: formData.visionAtmosphere,
          direction: formData.visionDirection,
          goals: formData.visionGoals.filter(Boolean)
        },
        planimetryImage: formData.planimetryImage,
        moodboardImages: formData.moodboardImages,
        inspirations: formData.inspirations,
        focusAreas: formData.focusAreas,
        proposal: {
          totalEstimate: formData.totalEstimate,
          timeline: formData.timeline
        }
      }
    });

    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 600);
  };

  // Helper per mostrare anteprima immagine o placeholder con supporto upload (cliccandola)
  const ImagePreview = ({ 
    src, 
    alt, 
    className = "h-32 w-full object-cover rounded-md border border-border",
    onUpload
  }: { 
    src: string, 
    alt: string, 
    className?: string,
    onUpload?: (base64: string) => void
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);
      try {
        const base64 = await resizeAndCompressImage(file);
        if (onUpload) onUpload(base64);
      } catch (err) {
        alert("Errore durante il caricamento dell'immagine: " + (err as Error).message);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    return (
      <div className="relative group overflow-hidden rounded-md border border-border">
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs z-20">
            <Loader2 className="w-5 h-5 animate-spin mb-1 text-accent" />
            <span>Elaborazione...</span>
          </div>
        )}
        
        {onUpload && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        )}

        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={src} 
            alt={alt} 
            className={className} 
            onError={(e) => { 
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12px" fill="%23999">Errore Immagine</text></svg>' 
            }} 
          />
        ) : (
          <div className={`bg-muted/20 flex items-center justify-center text-muted-foreground text-xs ${className}`}>
            Nessuna immagine
          </div>
        )}

        {src && src.includes('/generated/') && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-medium z-10 pointer-events-none">
            AI Default
          </div>
        )}

        {onUpload && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer z-10"
          >
            <Upload className="w-6 h-6 mb-1 text-[#C5A880]" />
            <span>Carica Immagine</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur z-50 py-4 border-b border-border">
        <div>
          <Link href={`/projects/${project.id}/strategic-output`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna all'Output Strategico
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-foreground">Editor Presentazione</h1>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {project.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={copyPresentationLink}
            className="inline-flex items-center justify-center rounded-md border border-[#C5A880]/30 bg-[#C5A880]/10 px-4 py-2.5 text-sm font-medium text-[#C5A880] shadow-sm transition-colors hover:bg-[#C5A880]/20"
          >
            {copiedLink ? <Check className="mr-1.5 h-4 w-4 text-green-500 animate-in fade-in" /> : <Share2 className="mr-1.5 h-4 w-4" />}
            {copiedLink ? "Link Copiato!" : "Condividi"}
          </button>
          <Link 
            href={`/presentation/${project.id}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/10"
          >
            Vedi Anteprima
          </Link>
          {showSaved && (
            <span className="inline-flex items-center text-sm font-medium text-green-600 animate-in fade-in duration-300">
              <Check className="mr-1.5 h-4 w-4" /> Salvato
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow hover:bg-accent/90 transition-colors disabled:opacity-70"
          >
            {isSaving ? "Salvataggio..." : <><Save className="mr-2 h-4 w-4" /> Salva Modifiche</>}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* HERO & CONCEPT */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center">
            <ImageIcon className="mr-3 h-5 w-5 text-accent" />
            <h2 className="text-xl font-serif">Copertina e Concept</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URL Immagine di Copertina (Hero)</label>
                <input 
                  type="text" name="heroImage" value={formData.heroImage} onChange={handleChange}
                  className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent focus:border-accent" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Testo Introduttivo Concept</label>
                <textarea 
                  rows={4} name="conceptText" value={formData.conceptText} onChange={handleChange}
                  className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent focus:border-accent resize-y" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Anteprima (Clicca per caricare)</label>
              <ImagePreview 
                src={formData.heroImage} 
                alt="Hero" 
                className="w-full aspect-[4/3] object-cover rounded-md border border-border" 
                onUpload={(base64) => setFormData(prev => ({ ...prev, heroImage: base64 }))}
              />
            </div>
          </div>
        </div>

        {/* VISION */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center">
            <FileText className="mr-3 h-5 w-5 text-accent" />
            <h2 className="text-xl font-serif">La Visione</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Atmosfera Desiderata</label>
                <input type="text" name="visionAtmosphere" value={formData.visionAtmosphere} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent focus:border-accent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Direzione Stilistica</label>
                <input type="text" name="visionDirection" value={formData.visionDirection} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent focus:border-accent" />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center justify-between">
                <span>Obiettivi Principali (Bulleted list)</span>
                <button onClick={() => addStringArrayItem('visionGoals', '')} className="text-accent hover:text-accent/80 text-xs flex items-center"><Plus className="w-3 h-3 mr-1" /> Aggiungi Obiettivo</button>
              </label>
              <div className="space-y-2">
                {formData.visionGoals.map((goal, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={goal} onChange={(e) => handleStringArrayChange('visionGoals', idx, e.target.value)} className="flex-1 bg-background border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent focus:border-accent" placeholder="Es. Atmosfera cosmopolita..." />
                    <button onClick={() => removeStringArrayItem('visionGoals', idx)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {formData.visionGoals.length === 0 && <p className="text-sm text-muted-foreground italic">Nessun obiettivo aggiunto.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* PLANIMETRY */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center">
            <LayoutTemplate className="mr-3 h-5 w-5 text-accent" />
            <h2 className="text-xl font-serif">Studio degli Spazi (Planimetria)</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URL Immagine Planimetria</label>
                <input 
                  type="text" name="planimetryImage" value={formData.planimetryImage} onChange={handleChange}
                  className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent focus:border-accent" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Anteprima (Clicca per caricare)</label>
              <ImagePreview 
                src={formData.planimetryImage} 
                alt="Planimetria" 
                className="w-full aspect-video object-contain bg-white rounded-md border border-border" 
                onUpload={(base64) => setFormData(prev => ({ ...prev, planimetryImage: base64 }))}
              />
            </div>
          </div>
        </div>

        {/* MOODBOARD */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center">
              <ImageIcon className="mr-3 h-5 w-5 text-accent" />
              <h2 className="text-xl font-serif">Moodboard Materiali</h2>
            </div>
            <button onClick={() => addArrayItem('moodboardImages', { url: '', tag: 'Nuovo Tag' })} className="text-sm bg-background border border-border px-3 py-1.5 rounded-md hover:bg-muted/10 flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Aggiungi Immagine
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {formData.moodboardImages.map((img, idx) => (
                <div key={idx} className="border border-border rounded-lg p-3 bg-muted/5 relative group">
                  <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => removeArrayItem('moodboardImages', idx)} className="bg-background/80 backdrop-blur p-1.5 rounded text-red-500 hover:bg-red-500 hover:text-white shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <ImagePreview 
                    src={img.url} 
                    alt={img.tag} 
                    className="w-full aspect-[4/5] object-cover rounded-md mb-3" 
                    onUpload={(base64) => handleArrayChange('moodboardImages', idx, 'url', base64)}
                  />
                  <div className="space-y-2">
                    <input type="text" value={img.tag} onChange={(e) => handleArrayChange('moodboardImages', idx, 'tag', e.target.value)} className="w-full bg-background border border-border rounded text-xs px-2 py-1.5" placeholder="Tag (es. Materiali)" />
                    <input type="text" value={img.url} onChange={(e) => handleArrayChange('moodboardImages', idx, 'url', e.target.value)} className="w-full bg-background border border-border rounded text-xs px-2 py-1.5" placeholder="URL Immagine" />
                  </div>
                </div>
              ))}
            </div>
            {formData.moodboardImages.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nessuna immagine nella moodboard. La sezione non sarà visibile.</p>}
          </div>
        </div>

        {/* INSPIRATIONS */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center">
              <Lightbulb className="mr-3 h-5 w-5 text-accent" />
              <h2 className="text-xl font-serif">Ispirazioni Visive</h2>
            </div>
            <button onClick={() => addArrayItem('inspirations', { url: '', caption: 'Didascalia', relevance: 'Motivazione' })} className="text-sm bg-background border border-border px-3 py-1.5 rounded-md hover:bg-muted/10 flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Aggiungi Ispirazione
            </button>
          </div>
          <div className="p-6 space-y-4">
            {formData.inspirations.map((insp, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 border border-border rounded-lg p-4 bg-muted/5 relative group">
                <button onClick={() => removeArrayItem('inspirations', idx)} className="absolute right-4 top-4 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                <div className="w-full md:w-48 shrink-0">
                  <ImagePreview 
                    src={insp.url} 
                    alt="Insp" 
                    className="w-full aspect-[4/3] object-cover rounded-md" 
                    onUpload={(base64) => handleArrayChange('inspirations', idx, 'url', base64)}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">URL Immagine</label>
                    <input type="text" value={insp.url} onChange={(e) => handleArrayChange('inspirations', idx, 'url', e.target.value)} className="w-full bg-background border border-border rounded text-sm px-3 py-1.5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Didascalia Principale</label>
                    <input type="text" value={insp.caption} onChange={(e) => handleArrayChange('inspirations', idx, 'caption', e.target.value)} className="w-full bg-background border border-border rounded text-sm px-3 py-1.5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Perché è rilevante?</label>
                    <input type="text" value={insp.relevance} onChange={(e) => handleArrayChange('inspirations', idx, 'relevance', e.target.value)} className="w-full bg-background border border-border rounded text-sm px-3 py-1.5" />
                  </div>
                </div>
              </div>
            ))}
            {formData.inspirations.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nessuna ispirazione. La sezione (immagini in alto) non sarà visibile.</p>}
          </div>
        </div>

        {/* FOCUS AREAS */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="mr-3 h-5 w-5 text-accent" />
              <h2 className="text-xl font-serif">Punti Focali del Progetto</h2>
            </div>
            <button onClick={() => addArrayItem('focusAreas', { title: 'Nuovo Focus', description: '', imageUrl: '' })} className="text-sm bg-background border border-border px-3 py-1.5 rounded-md hover:bg-muted/10 flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Aggiungi Focus Area
            </button>
          </div>
          <div className="p-6 space-y-4">
            {formData.focusAreas.map((focus, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 border border-border rounded-lg p-4 bg-muted/5 relative group">
                <button onClick={() => removeArrayItem('focusAreas', idx)} className="absolute right-4 top-4 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                <div className="w-full md:w-64 shrink-0">
                  <ImagePreview 
                    src={focus.imageUrl} 
                    alt={focus.title} 
                    className="w-full aspect-[4/3] object-cover rounded-md" 
                    onUpload={(base64) => handleArrayChange('focusAreas', idx, 'imageUrl', base64)}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Titolo Area Focale</label>
                    <input type="text" value={focus.title} onChange={(e) => handleArrayChange('focusAreas', idx, 'title', e.target.value)} className="w-full bg-background border border-border rounded text-sm px-3 py-1.5" placeholder="Es. Il Banco Bar" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Descrizione</label>
                    <textarea rows={2} value={focus.description} onChange={(e) => handleArrayChange('focusAreas', idx, 'description', e.target.value)} className="w-full bg-background border border-border rounded text-sm px-3 py-1.5 resize-y" placeholder="Descrivi i dettagli..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">URL Immagine</label>
                    <input type="text" value={focus.imageUrl} onChange={(e) => handleArrayChange('focusAreas', idx, 'imageUrl', e.target.value)} className="w-full bg-background border border-border rounded text-sm px-3 py-1.5" />
                  </div>
                </div>
              </div>
            ))}
            {formData.focusAreas.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nessuna area focale aggiunta.</p>}
          </div>
        </div>

        {/* PROPOSTA */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center">
            <CheckCircle2 className="mr-3 h-5 w-5 text-accent" />
            <h2 className="text-xl font-serif">Proposta e Tempistiche</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Investimento Stimato</label>
              <input type="text" name="totalEstimate" value={formData.totalEstimate} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent focus:border-accent" placeholder="es. 185.000 €" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tempistiche Stimate</label>
              <input type="text" name="timeline" value={formData.timeline} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent focus:border-accent" placeholder="es. 12 Settimane" />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
