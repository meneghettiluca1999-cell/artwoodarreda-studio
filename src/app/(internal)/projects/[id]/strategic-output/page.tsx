"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, TrendingUp, FileText, CheckCircle2, ChevronRight, BarChart2, Edit, Loader2, MapPin, Building2, Target, Users, Palette, StickyNote, Trash2, X, Lightbulb, Share2 } from "lucide-react";
import { useProjects } from "@/contexts/ProjectContext";
import { geocodeAddress, findCompetitors, EnrichedCompetitor } from "@/lib/geo-api";
import { exportToPDF } from "@/lib/pdf-service";
import { ReportPdfTemplate } from "@/components/ReportPdfTemplate";
import { useRef } from "react";

export default function StrategicOutputPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getProject } = useProjects();
  const project = getProject(resolvedParams.id);
  const [activeTab, setActiveTab] = useState<'insights' | 'competitors' | 'report'>('insights');
  const [competitors, setCompetitors] = useState<EnrichedCompetitor[]>([]);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
  const [competitorsFetched, setCompetitorsFetched] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState<string | null>(null);
  const [ignoredCompetitorIds, setIgnoredCompetitorIds] = useState<string[]>([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualComp, setManualComp] = useState({ name: '', type: '', distance: 500 });
  const [editingCompetitorId, setEditingCompetitorId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<EnrichedCompetitor>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const { updateProject } = useProjects();
  const [copied, setCopied] = useState(false);
  
  // Custom Report state
  const [customAtmosphere, setCustomAtmosphere] = useState(project?.customReport?.atmosphereInsight || "");
  const [customWowPoints, setCustomWowPoints] = useState(project?.customReport?.wowPoints?.join("\n\n") || "");
  const [customStrategy, setCustomStrategy] = useState(project?.customReport?.competitorStrategy || "");

  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const handleStartEdit = (comp: EnrichedCompetitor) => {
    setEditingCompetitorId(comp.id);
    setEditFormData(comp);
  };

  const handleSaveEdit = () => {
    if (editingCompetitorId) {
      setCompetitors(prev => prev.map(c => c.id === editingCompetitorId ? { ...c, ...editFormData } as EnrichedCompetitor : c));
    }
    setEditingCompetitorId(null);
  };

  const handleAddManualCompetitor = () => {
    if (!manualComp.name || !manualComp.type) return;
    const newComp: EnrichedCompetitor = {
      id: `manual-${Date.now()}`,
      name: manualComp.name,
      type: manualComp.type,
      distance: manualComp.distance,
      threatLevel: manualComp.distance < 1500 ? 'high' : 'medium',
      proximityZone: manualComp.distance < 1500 ? 'Vicinissimo (aggiunto a mano)' : 'Vicinanza (aggiunto a mano)',
      typeMatch: 'direct',
      estimatedRating: null,
      estimatedReviews: null,
      priceLevel: '€€'
    };
    setCompetitors(prev => [newComp, ...prev]);
    setShowManualAdd(false);
    setManualComp({ name: '', type: '', distance: 500 });
  };
  
  const visibleCompetitors = competitors.filter(c => !ignoredCompetitorIds.includes(c.id)).slice(0, 15);

  useEffect(() => {
    if (activeTab === 'competitors' && project && !competitorsFetched) {
      const fetchCompetitors = async () => {
        setIsLoadingCompetitors(true);
        const typesArray = project.type.split(',').map(t => t.trim());
        const coords = await geocodeAddress(project.location || 'Milano');
        
        if (coords) {
          setResolvedLocation(coords.displayName);
          const results = await findCompetitors(coords.lat, coords.lon, typesArray, 5000); // 5km
          setCompetitors(results); // Store all up to 50
        } else {
          setResolvedLocation("Indirizzo non trovato");
        }
        
        setCompetitorsFetched(true);
        setIsLoadingCompetitors(false);
      };
      
      fetchCompetitors();
    }
  }, [activeTab, project, competitorsFetched]);

  if (!project) return <div>Progetto non trovato</div>;

  const copyPresentationLink = () => {
    const link = `${window.location.origin}/presentation/${project.id}`;
    const text = `Ecco il link alla presentazione del progetto "${project.name}":\n${link}\n\nPassword di accesso: ${project.password || "artwood"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper: generate dynamic AI insights based on project data
  const generateAtmosphereInsight = () => {
    let insight = `L'analisi semantica delle direttive di progetto evidenzia un chiaro potenziale per ${project.name}. `;
    if (project.positioning && project.positioning !== "Non specificato") {
      insight += `Il posizionamento ${project.positioning} richiesto per la zona di ${project.location || "riferimento"} necessita di una forte polarizzazione visiva. `;
    }
    if (project.visualDirection && project.visualDirection !== "Non specificato") {
      insight += `La scelta di un'impronta "${project.visualDirection}" funge da connettore empatico ideale: non si tratta solo di estetica, ma di tradurre i valori del brand in un'esperienza spaziale immersiva che stimoli la permanenza e incrementi lo scontrino medio.`;
    } else {
      insight += `Si raccomanda l'elaborazione di un'identità estetica fortemente distintiva per rompere il rumore di fondo del mercato locale e fidelizzare la clientela fin dalla prima visita.`;
    }
    return insight;
  };

  const generateWowPoints = () => {
    const points: string[] = [];
    if (project.focusElements && project.focusElements !== "Non specificato") {
      project.focusElements.split(",").map(e => e.trim()).forEach(el => {
        if (el) points.push(`Trasformare '${el}' da semplice elemento funzionale a vero e proprio 'hero piece' scenografico per incentivare la condivisione social (Instagrammabilità).`);
      });
    }
    if (project.materials && project.materials !== "Non specificato") {
      points.push(`Sfruttare la palette materica (${project.materials}) per creare layer tattili che aumentino la percezione premium dell'ambiente.`);
    }
    if (project.targetAudience && project.targetAudience !== "Non specificato") {
      points.push(`Progettare l'ergonomia e i flussi specificatamente per il target (${project.targetAudience}), riducendo i punti di frizione durante le ore di punta.`);
    }
    if (points.length === 0) {
      points.push("Mancano dati sufficienti per elaborare strategie avanzate. Si consiglia di arricchire il brief.");
    }
    return points;
  };

  const generateCompetitorStrategy = () => {
    if (visibleCompetitors.length === 0) return "L'algoritmo non ha rilevato masse critiche di competitor nel raggio d'azione selezionato. Si apre un'opportunità di monopolio della nicchia.";
    
    const types = [...new Set(visibleCompetitors.map(c => c.type))];
    const veryClose = visibleCompetitors.filter(c => c.distance < 1500).length;
    
    let strategy = `L'analisi geo-spaziale su ${project.location || "l'area"} rileva una saturazione di mercato `;
    strategy += visibleCompetitors.length > 5 ? "medio-alta" : "bassa";
    strategy += `, con una concentrazione specifica nel segmento ${types.slice(0, 2).join(" e ")}. `;
    
    if (veryClose > 0) {
      strategy += `La presenza di ${veryClose} competitor in un raggio di prossimità critica (< 1.5km) impone una strategia di differenziazione netta. `;
    } else {
      strategy += `L'assenza di competitor diretti nell'immediata prossimità garantisce un vantaggio tattico per intercettare il bacino d'utenza locale. `;
    }
    
    if (project.positioning && project.positioning !== "Non specificato") {
      strategy += `Per validare il posizionamento ${project.positioning}, l'Intelligenza Artificiale suggerisce di spingere sui "signature elements" progettuali, eludendo la competizione sul prezzo e puntando sull'esclusività percepita dell'esperienza.`;
    }
    
    return strategy;
  };

  // Set default values for custom report if they are empty
  useEffect(() => {
    if (project && !customAtmosphere && !project.customReport?.atmosphereInsight) {
      setCustomAtmosphere(generateAtmosphereInsight());
    }
    if (project && !customWowPoints && (!project.customReport?.wowPoints || project.customReport.wowPoints.length === 0)) {
      setCustomWowPoints(generateWowPoints().join("\n\n"));
    }
    if (project && !customStrategy && !project.customReport?.competitorStrategy) {
      setCustomStrategy(generateCompetitorStrategy());
    }
  }, [project, competitorsFetched]);

  const handleSaveReport = () => {
    if (project) {
      updateProject(project.id, {
        customReport: {
          atmosphereInsight: customAtmosphere,
          wowPoints: customWowPoints.split("\n\n").filter(p => p.trim() !== ""),
          competitorStrategy: customStrategy,
        }
      });
      setIsEditingReport(false);
    }
  };

  const finalAtmosphere = project.customReport?.atmosphereInsight || generateAtmosphereInsight();
  const finalWowPoints = project.customReport?.wowPoints || generateWowPoints();
  const finalStrategy = project.customReport?.competitorStrategy || generateCompetitorStrategy();

  const handleExportPDF = async () => {
    if (!pdfTemplateRef.current) return;
    setIsExporting(true);
    try {
      await exportToPDF(pdfTemplateRef.current, {
        filename: `Report_Strategico_${project.name.replace(/\s+/g, '_')}.pdf`,
        margin: 0
      });
    } catch (error: any) {
      console.error(error);
      alert(`Errore durante l'esportazione del PDF: ${error.message || error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 md:py-8">
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="w-full lg:w-auto">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 md:mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
            <h1 className="text-2xl md:text-3xl font-serif text-foreground break-words">{project.name}</h1>
            <span className="inline-flex w-fit items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent whitespace-nowrap">
              Output Strategico
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">Analisi AI e report strategico per {project.clientName}.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 md:gap-3">
          <Link 
            href={`/projects/${project.id}/edit`}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/10"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Link>
          <Link 
            href={`/projects/${project.id}/edit-presentation`}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/10"
          >
            <Edit className="mr-2 h-4 w-4" />
            Presentazione
          </Link>
          <button 
            onClick={copyPresentationLink}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-[#C5A880]/30 bg-[#C5A880]/10 px-4 py-2 text-sm font-medium text-[#C5A880] shadow-sm transition-colors hover:bg-[#C5A880]/20"
          >
            {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 animate-in fade-in" /> : <Share2 className="mr-2 h-4 w-4" />}
            {copied ? "Link Copiato!" : "Condividi"}
          </button>
          <Link 
            href={`/presentation/${project.id}`}
            target="_blank"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow transition-colors hover:bg-foreground/90"
          >
            Anteprima
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-x-1 border-b border-border mb-6 md:mb-8 pb-px">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'insights' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Insights
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          className={`flex items-center whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'competitors' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Competitor Analysis
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'report' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="mr-2 h-4 w-4" />
          Report Strategico
        </button>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        {activeTab === 'insights' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-serif flex items-center">
                  <Sparkles className="mr-3 h-6 w-6 text-accent" />
                  Direzione Consigliata
                </h2>
                
                {isEditingReport ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditingReport(false)}
                      className="px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-muted"
                    >
                      Annulla
                    </button>
                    <button 
                      onClick={handleSaveReport}
                      className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Salva Modifiche
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingReport(true)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors text-muted-foreground"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifica Testi Report
                  </button>
                )}
              </div>
              
              {/* Spiegazione AI */}
              <div className="mb-6 p-4 bg-muted/30 border border-border rounded-xl flex items-start text-sm text-muted-foreground">
                <Lightbulb className="w-5 h-5 mr-3 text-amber-500 shrink-0" />
                <p>
                  I testi in questa sezione sono generati da un <strong>motore euristico deterministico interno</strong>.
                  Analizza parametri come metratura, materiali, focus e posizionamento per simulare un'analisi strategica. 
                  Non vengono effettuate chiamate a LLM esterni, garantendo massima privacy e velocità. Puoi cliccare su "Modifica Testi" per personalizzarli.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-border bg-background/50 flex flex-col">
                  <h3 className="font-medium text-lg mb-3">Atmosfera & Concept</h3>
                  {isEditingReport ? (
                    <textarea 
                      value={customAtmosphere}
                      onChange={(e) => setCustomAtmosphere(e.target.value)}
                      className="w-full flex-1 min-h-[200px] p-3 text-sm leading-relaxed text-foreground bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                      {finalAtmosphere}
                    </p>
                  )}
                </div>
                <div className="p-6 rounded-xl border border-border bg-background/50 flex flex-col">
                  <h3 className="font-medium text-lg mb-3">Punti Wow (Opportunità)</h3>
                  {isEditingReport ? (
                    <textarea 
                      value={customWowPoints}
                      onChange={(e) => setCustomWowPoints(e.target.value)}
                      placeholder="Separa i punti inserendo una riga vuota tra uno e l'altro..."
                      className="w-full flex-1 min-h-[200px] p-3 text-sm leading-relaxed text-foreground bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  ) : (
                    <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                      {finalWowPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start bg-card p-3 rounded-lg border border-border/50">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-accent mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Project Data Summary */}
            <div>
              <h2 className="text-2xl font-serif mb-6">Riepilogo Dati Raccolti</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    <Building2 className="mr-2 h-3.5 w-3.5" /> Tipologia
                  </div>
                  <p className="text-sm text-foreground font-medium">{project.type}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    <MapPin className="mr-2 h-3.5 w-3.5" /> Location
                  </div>
                  <p className="text-sm text-foreground font-medium">{project.location}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    <Target className="mr-2 h-3.5 w-3.5" /> Metratura
                  </div>
                  <p className="text-sm text-foreground font-medium">{project.sizeSqM ? `${project.sizeSqM} mq` : "Non specificato"}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    <Users className="mr-2 h-3.5 w-3.5" /> Posti a Sedere
                  </div>
                  <p className="text-sm text-foreground font-medium">{project.seatingCapacity ? `${project.seatingCapacity}` : "Non specificato"}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    <Target className="mr-2 h-3.5 w-3.5" /> Posizionamento
                  </div>
                  <p className="text-sm text-foreground font-medium">{project.positioning}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    <Users className="mr-2 h-3.5 w-3.5" /> Target
                  </div>
                  <p className="text-sm text-foreground font-medium">{project.targetAudience}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    <Palette className="mr-2 h-3.5 w-3.5" /> Stile
                  </div>
                  <p className="text-sm text-foreground font-medium">{project.visualDirection || "Non specificato"}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    <StickyNote className="mr-2 h-3.5 w-3.5" /> Materiali
                  </div>
                  <p className="text-sm text-foreground font-medium">{project.materials || "Non specificato"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-serif flex items-center">
                  <BarChart2 className="mr-3 h-6 w-6 text-accent" />
                  Analisi Competitor (Raggio 5km da {project.location || 'Zona Selezionata'})
                </h2>
                <button
                  onClick={() => setShowManualAdd(!showManualAdd)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  + Aggiungi Competitor
                </button>
              </div>
              
              {isLoadingCompetitors ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-accent" />
                  <p>Ricerca e analisi dei competitor nell&apos;area in corso...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Nome Locale</th>
                        <th className="px-6 py-4 font-medium">Tipologia & Fascia</th>
                        <th className="px-6 py-4 font-medium">Distanza</th>
                        <th className="px-6 py-4 font-medium">Valutazione Minaccia</th>
                        <th className="px-6 py-4 font-medium text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCompetitors.length > 0 ? visibleCompetitors.map((comp, idx) => (
                        editingCompetitorId === comp.id ? (
                          <tr key={comp.id} className="border-b border-border bg-muted/10">
                            <td className="px-6 py-4">
                              <input 
                                type="text" 
                                value={editFormData.name || ''} 
                                onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                                className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="text" 
                                value={editFormData.type || ''} 
                                onChange={e => setEditFormData({...editFormData, type: e.target.value})} 
                                className="w-full bg-background border border-border rounded px-2 py-1 text-sm mb-1"
                              />
                              <input 
                                type="text" 
                                value={editFormData.priceLevel || ''} 
                                onChange={e => setEditFormData({...editFormData, priceLevel: e.target.value})} 
                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                                placeholder="Fascia di prezzo"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="number" 
                                value={editFormData.distance || 0} 
                                onChange={e => setEditFormData({...editFormData, distance: Number(e.target.value)})} 
                                className="w-full bg-background border border-border rounded px-2 py-1 text-sm mb-1"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                value={editFormData.threatLevel || 'medium'} 
                                onChange={e => setEditFormData({...editFormData, threatLevel: e.target.value as any})} 
                                className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                              >
                                <option value="high">Alta (Diretta)</option>
                                <option value="medium">Media</option>
                                <option value="low">Bassa</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                              <button
                                onClick={handleSaveEdit}
                                className="text-green-600 hover:text-green-700 transition-colors bg-green-500/10 p-1.5 rounded"
                                title="Salva modifiche"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingCompetitorId(null)}
                                className="text-muted-foreground hover:text-foreground transition-colors bg-muted/20 p-1.5 rounded"
                                title="Annulla"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ) : (
                        <tr key={comp.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">
                            {comp.name}
                            {comp.estimatedRating && comp.estimatedRating >= 4.5 && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">TOP</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <div>{comp.type}</div>
                            <div className="text-xs text-muted-foreground/70 mt-1">{comp.priceLevel}</div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <div>{(comp.distance / 1000).toFixed(1)} km</div>
                            <div className="text-xs text-muted-foreground/70 mt-1">{comp.proximityZone}</div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-xs">
                            {comp.threatLevel === 'high' ? (
                              <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-red-600 font-medium border border-red-500/20">Alta (Diretta)</span>
                            ) : comp.threatLevel === 'medium' ? (
                              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-600 font-medium border border-amber-500/20">Media</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-green-600 font-medium border border-green-500/20">Bassa</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                            <button
                              onClick={() => handleStartEdit(comp)}
                              className="text-muted-foreground hover:text-accent transition-colors bg-muted/10 p-1.5 rounded"
                              title="Modifica competitor"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setIgnoredCompetitorIds(prev => [...prev, comp.id])}
                              className="text-muted-foreground hover:text-red-500 transition-colors bg-muted/10 p-1.5 rounded"
                              title="Escludi dall'analisi"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                        )
                      )) : (
                        <tr className="border-b border-border">
                          <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                            Nessun competitor rilevato in zona.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {showManualAdd && (
                <div className="mt-4 p-4 border border-border bg-muted/10 rounded-xl">
                  <h4 className="text-sm font-medium mb-3">Aggiungi Competitor Manuale</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs mb-1 text-muted-foreground">Nome Locale</label>
                      <input 
                        type="text" 
                        value={manualComp.name} 
                        onChange={e => setManualComp(p => ({...p, name: e.target.value}))} 
                        className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm"
                        placeholder="Es. Bar Roma"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-muted-foreground">Tipologia</label>
                      <input 
                        type="text" 
                        value={manualComp.type} 
                        onChange={e => setManualComp(p => ({...p, type: e.target.value}))} 
                        className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm"
                        placeholder="Es. Caffetteria"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-muted-foreground">Distanza (metri)</label>
                      <input 
                        type="number" 
                        value={manualComp.distance} 
                        onChange={e => setManualComp(p => ({...p, distance: Number(e.target.value)}))} 
                        className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <button 
                        onClick={handleAddManualCompetitor}
                        className="w-full bg-accent text-accent-foreground rounded px-3 py-1.5 text-sm font-medium hover:bg-accent/90"
                      >
                        Aggiungi
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 p-6 bg-accent/5 border border-accent/20 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-serif text-foreground">Competitor Diretti</h3>
                    <p className="text-sm text-muted-foreground mt-1">Locali simili in un raggio di 5km</p>
                    {resolvedLocation && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Centro di ricerca: {resolvedLocation}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-accent">Spunto Strategico</h3>
                  {isEditingReport ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsEditingReport(false)}
                        className="px-2 py-1 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted"
                      >
                        Annulla
                      </button>
                      <button 
                        onClick={handleSaveReport}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Salva
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditingReport(true)}
                      className="flex items-center px-2 py-1 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors text-muted-foreground"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifica
                    </button>
                  )}
                </div>
                {isEditingReport ? (
                  <textarea 
                    value={customStrategy}
                    onChange={(e) => setCustomStrategy(e.target.value)}
                    className="w-full min-h-[120px] p-3 text-sm leading-relaxed text-foreground bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {finalStrategy}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-border pb-6">
                <div>
                  <h2 className="text-2xl font-serif text-foreground">Report Strategico</h2>
                  <p className="text-muted-foreground mt-1 text-sm">Sintesi completa del progetto e posizionamento</p>
                </div>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm transition-colors disabled:opacity-70"
                >
                  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  {isExporting ? "Generazione PDF..." : "Scarica Riepilogo PDF"}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Info Base & Note */}
                <div className="space-y-6">
                  <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-accent" />
                      Anagrafica
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Progetto</div>
                        <div className="font-medium text-foreground">{project.name}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Cliente</div>
                        <div className="font-medium text-foreground">{project.clientName}</div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tipologia</span>
                          <span className="font-medium">{project.type}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Stato</span>
                          <span className="font-medium">{project.status === 'new' ? 'Nuovo locale' : project.status === 'restyling' ? 'Restyling' : 'Ampliamento'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {project.notes && (
                    <div className="p-6 rounded-xl border border-border bg-accent/5">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <StickyNote className="w-5 h-5 mr-2 text-accent" />
                        Note Private
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground/80 italic">
                        "{project.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Column 2 & 3: Dettagli Strategici e Mappa */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-accent" />
                        Posizionamento
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Target</div>
                          <div className="text-sm font-medium">{project.targetAudience || "Non specificato"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Livello</div>
                          <div className="text-sm font-medium">{project.positioning || "Non specificato"}</div>
                        </div>
                        {project.goals && (
                          <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Obiettivi</div>
                            <div className="text-sm font-medium">{project.goals}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-accent" />
                        Direzione Estetica
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stile & Mood</div>
                          <div className="text-sm font-medium">{project.visualDirection || "Da definire"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Focus Elements</div>
                          <div className="text-sm font-medium">{project.focusElements || "Non specificati"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Materiali</div>
                          <div className="text-sm font-medium">{project.materials || "Non specificati"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {project.location && project.location !== "Non specificato" && (
                    <div className="p-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden h-64">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0, borderRadius: '0.5rem' }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(project.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      ></iframe>
                    </div>
                  )}

                  {competitorsFetched && competitors.length > 0 && (
                    <div className="p-6 rounded-xl border border-border bg-stone-900 text-stone-100 shadow-sm">
                      <h3 className="font-semibold text-lg mb-4 flex items-center text-white">
                        <TrendingUp className="w-5 h-5 mr-2 text-accent" />
                        Radar Competitivo
                      </h3>
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-800">
                        <div className="text-sm text-stone-400">
                          Raggio analisi: <strong>15km</strong><br/>
                          Centro: <strong>{project.location}</strong>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">{competitors.length}</div>
                          <div className="text-xs text-stone-400 uppercase tracking-widest">Competitor trovati</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {competitors.slice(0, 3).map(c => (
                          <div key={c.id} className="flex justify-between items-center text-sm bg-stone-800/50 p-2 rounded">
                            <span className="font-medium text-stone-200 truncate w-3/5">{c.name}</span>
                            <span className="text-stone-400 text-xs w-1/5">{c.type}</span>
                            <span className="text-accent text-right w-1/5 font-mono">{(c.distance / 1000).toFixed(1)}km</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden PDF Template rendered off-screen */}
      <ReportPdfTemplate 
        ref={pdfTemplateRef}
        project={project}
        competitors={visibleCompetitors}
        atmosphereInsight={finalAtmosphere}
        wowPoints={finalWowPoints}
        competitorStrategy={finalStrategy}
      />
    </div>
  );
}
