"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/contexts/ProjectContext";

const steps = [
  { id: 1, title: "Identità del locale", description: "Dati base e concept" },
  { id: 2, title: "Target & Obiettivi", description: "Posizionamento e clientela" },
  { id: 3, title: "Stile & Atmosfera", description: "Direzione visiva e mood" },
];

const venueTypes = ["Bar", "Pasticceria", "Gelateria", "Panetteria", "Ristorante", "Pizzeria", "Hamburgheria"];

export default function NewProjectWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { addProject } = useProjects();

  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    location: "",
    sizeSqM: 0,
    seatingCapacity: 0,
    types: [] as string[],
    target: "",
    positioning: "",
    businessGoals: "",
    visualDirection: "",
    materials: "",
    focusElements: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const nextStep = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(curr => curr + 1);
    } else {
      // Form completion
      try {
        setIsSubmitting(true);
        const newId = await addProject({
          name: formData.name || "Nuovo Progetto",
          clientName: formData.clientName || "Cliente Anonimo",
          status: "new",
          type: formData.types.length > 0 ? formData.types.join(", ") : "Non specificato",
          location: formData.location || "Non specificato",
          venueName: formData.name || "Nuovo Locale",
          sizeSqM: formData.sizeSqM || 0,
          seatingCapacity: formData.seatingCapacity || 0,
          budget: "Non specificato",
          targetAudience: formData.target || "Non specificato",
          positioning: formData.positioning || "Non specificato",
          goals: formData.businessGoals || "Non specificato",
          visualDirection: formData.visualDirection || "Non specificato",
          materials: formData.materials || "Non specificato",
          focusElements: formData.focusElements || "Non specificato",
          notes: formData.notes || ""
        });
        router.push(`/projects/${newId}/strategic-output`);
      } catch (err) {
        console.error(err);
        alert("Errore durante la creazione del progetto.");
        setIsSubmitting(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Link>
        <h1 className="text-3xl font-serif text-foreground">Nuovo Progetto</h1>
        <p className="text-muted-foreground mt-2">Raccogli i dati durante il colloquio con il cliente.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-border -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-accent transition-all duration-500 ease-in-out -z-10"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-accent border-accent text-accent-foreground' 
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-medium">{step.id}</span>}
              </div>
              <div className="mt-3 text-center absolute top-12 w-32 -ml-11">
                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</p>
                <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content Area */}
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm min-h-[400px] mt-20">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif mb-6">Informazioni di Base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nome Progetto (Interno)</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. Progetto Lumina" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cliente</label>
                  <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="Nome referente" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Indirizzo e Città</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. Via Garibaldi 10, Milano" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Grandezza Locale (mq)</label>
                  <input type="number" name="sizeSqM" value={formData.sizeSqM || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. 120" min="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Posti a sedere previsti</label>
                  <input type="number" name="seatingCapacity" value={formData.seatingCapacity || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. 40" min="0" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Tipologia Locale (Seleziona una o più)</label>
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
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif mb-6">Target e Posizionamento</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Target Clientela</label>
                  <textarea 
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    rows={3} 
                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none" 
                    placeholder="Descrivi chi frequenterà il locale (età, professione, abitudini)..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Fascia di Posizionamento</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Budget', 'Casual', 'Premium Casual', 'Luxury'].map((pos) => (
                      <div 
                        key={pos} 
                        onClick={() => setFormData({ ...formData, positioning: pos })}
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
                  <input type="text" name="businessGoals" value={formData.businessGoals} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" placeholder="es. Aumentare coperti serali, creare un format replicabile..." />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif mb-6">Stile e Atmosfera</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Direzione Visiva Desiderata</label>
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
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between pt-6 border-t border-border">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentStep === 1 ? 'text-muted-foreground cursor-not-allowed opacity-50' : 'text-foreground hover:bg-muted/10'
            }`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </button>
          
          <button
            onClick={nextStep}
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generazione...
              </>
            ) : (
              <>
                {currentStep === steps.length ? 'Genera Strategia' : 'Avanti'}
                {currentStep !== steps.length && <ArrowRight className="ml-2 h-4 w-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
