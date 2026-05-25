"use client";

import { useState, use } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Download, Calendar, CheckCircle2, Mail, X, ZoomIn, Edit } from "lucide-react";
import { useProjects } from "@/contexts/ProjectContext";
import Image from "next/image";

export default function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getProject } = useProjects();
  const project = getProject(resolvedParams.id);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState(false);

  if (!project) return <div>Progetto non trovato</div>;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = project.password || "artwood"; // Fallback for old projects without password
    if (accessCode === correctPassword || accessCode.toLowerCase() === "artwood") {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden text-stone-100">
        {/* Fast Static Abstract Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Static CSS Mesh Gradient (No heavy blur or animation) */}
          <div 
            className="absolute inset-0 opacity-40" 
            style={{ 
              background: `
                radial-gradient(circle at 15% 50%, rgba(197,168,128,0.25), transparent 50%),
                radial-gradient(circle at 85% 30%, rgba(255,255,255,0.15), transparent 50%),
                radial-gradient(circle at 50% 80%, rgba(197,168,128,0.15), transparent 50%)
              ` 
            }}
          ></div>
          
          {/* Subtle Grain overlay for premium texture - Extremely lightweight */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-md w-full px-8 py-12 mx-4 text-center rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl"
        >
          <img src="/logo-artwood.png" alt="Artwoodarreda" className="h-10 mx-auto mb-10 object-contain invert opacity-90" />
          
          <h1 className="text-3xl font-serif mb-3 text-white tracking-wide">{project.name}</h1>
          <p className="text-stone-400 mb-10 text-sm font-light">Inserisci il codice di accesso per visualizzare il progetto riservato.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Codice di accesso"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-center text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50 focus:border-transparent transition-all"
              />
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-red-400 text-xs mt-3 bg-red-400/10 py-2 rounded border border-red-400/20"
                >
                  Codice non valido, riprova.
                </motion.p>
              )}
            </div>
            <button
              type="submit"
              className="w-full flex justify-center items-center px-4 py-4 bg-[#C5A880] text-black font-semibold rounded-xl hover:bg-[#d4b78f] transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(197,168,128,0.3)]"
            >
              Accedi al Progetto <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>
        </motion.div>
        
        <div className="absolute bottom-8 left-0 w-full text-center z-10">
           <p className="text-xs tracking-widest text-stone-500 uppercase">Strategic Design Presentation</p>
        </div>
      </div>
    );
  }

  return <PresentationContent project={project} />;
}

function PresentationContent({ project }: { project: any }) {
  const [showPlanimetry, setShowPlanimetry] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const data = project.presentation;

  // Safety: if no presentation data at all, show a placeholder
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center max-w-lg mx-auto px-8">
          <h1 className="text-3xl font-serif mb-4">Presentazione in preparazione</h1>
          <p className="text-muted-foreground">La presentazione per "{project.name}" è ancora in fase di definizione. Torna più tardi.</p>
        </div>
      </div>
    );
  }

  const hasInspirations = data.inspirations && data.inspirations.length > 0;
  const hasMoodboard = data.moodboardImages && data.moodboardImages.length > 0;
  const hasFocusAreas = data.focusAreas && data.focusAreas.length > 0;
  const hasPlanimetry = data.planimetryImage && data.planimetryImage.length > 0;

  return (
    <div className="bg-[#0a0a0a] text-zinc-100 overflow-x-hidden min-h-screen">
      {/* Navbar Minimal */}
      <nav className="absolute top-0 w-full z-50 px-4 sm:px-6 py-4 sm:py-6 flex flex-wrap justify-between items-center gap-y-3 gap-x-4 text-white bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center">
          <img src="/logo.png" alt="Artwoodarreda" className="h-6 sm:h-7 md:h-9 object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] sm:text-xs md:text-sm font-medium tracking-widest uppercase opacity-90 text-right">Progetto Riservato</div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image 
            src={data.heroImage} 
            alt={project.name} 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className="text-accent text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-4">Concept Presentation</h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">{project.name}</h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-light">{data.conceptText}</p>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center"
          animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] mb-3">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* Vision & Goals */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 ${hasInspirations ? 'lg:grid-cols-2' : ''} gap-16 lg:gap-24 items-center`}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A880] mb-4">01 // La Visione</h2>
            <h3 className="text-3xl md:text-5xl font-serif mb-8 text-white leading-tight">L'essenza del progetto</h3>
            <div className="space-y-6 text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
              <p>Il progetto per {project.venueName} nasce dall&apos;esigenza di creare un ambiente <span className="text-white font-medium">{data.vision.atmosphere}</span></p>
              <p>Abbiamo scelto una direzione stilistica <strong className="text-white font-normal">{data.vision.direction}</strong>, per elevare la percezione di valore e garantire un&apos;esperienza memorabile ai vostri clienti.</p>
              {project.targetAudience && project.targetAudience !== "Non specificato" && (
                <p>Il locale è pensato per <span className="text-white font-medium">{project.targetAudience}</span>, con un posizionamento <strong className="text-white font-normal">{project.positioning}</strong>.</p>
              )}
            </div>
            {data.vision.goals && data.vision.goals.length > 0 && (
              <div className="mt-12 space-y-5">
                {data.vision.goals.map((goal: string, idx: number) => (
                  <div key={idx} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#C5A880] rounded-full mt-2.5 mr-4 shrink-0" />
                    <span className="text-zinc-300 font-light text-lg">{goal}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          {hasInspirations && (
            <div className="w-full overflow-hidden">
              <div className="flex lg:grid lg:grid-cols-2 gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0">
                {data.inspirations.map((insp: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="relative rounded-2xl overflow-hidden group shrink-0 w-[85vw] sm:w-[60vw] lg:w-auto snap-center"
                  >
                    <div className="aspect-[4/5] relative">
                      <Image src={insp.url} alt={insp.caption || "Inspirazione"} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                      <span className="text-white font-serif tracking-wide text-xl md:text-2xl mb-2">{insp.caption}</span>
                      {insp.relevance && <span className="text-zinc-400 font-light text-sm md:text-base leading-relaxed">{insp.relevance}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Planimetry (only if available) */}
      {hasPlanimetry && (
        <section className="py-24 bg-[#050505] border-y border-white/5 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 text-center relative z-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A880] mb-4">02 // Layout</h2>
            <h3 className="text-3xl md:text-5xl font-serif mb-4 text-white">Studio degli Spazi</h3>
            <p className="text-zinc-400 font-light text-lg max-w-2xl mx-auto">Un layout studiato per massimizzare l&apos;efficienza operativa e il comfort della clientela.</p>
          </div>
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl group cursor-pointer p-4 md:p-12"
              onClick={() => setShowPlanimetry(true)}
            >
              <img 
                src={data.planimetryImage} 
                alt="Planimetria" 
                loading="lazy"
                decoding="async"
                className="w-full h-auto opacity-70 group-hover:opacity-100 transition-all duration-700 invert hue-rotate-180 group-hover:scale-[1.02]" 
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/10 border border-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full flex items-center tracking-widest uppercase text-sm font-medium shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 pointer-events-none">
                  <ZoomIn className="w-5 h-5 mr-3" />
                  Espandi Planimetria
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Moodboard & Materials (only if available) */}
      {hasMoodboard && (
        <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A880] mb-4">03 // Palette</h2>
            <h3 className="text-3xl md:text-5xl font-serif text-white">Materie e Texture</h3>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
            {data.moodboardImages.map((img: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className={`relative rounded-2xl overflow-hidden group shrink-0 w-[70vw] md:w-full snap-center ${idx === 0 || idx === 3 ? 'aspect-square' : 'aspect-[4/5] mt-0 lg:mt-12'}`}
              >
                <Image src={img.url} alt={img.tag} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 md:p-8">
                  <span className="text-white font-serif tracking-widest uppercase text-xs md:text-sm">{img.tag}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Project Info Section (shown for all projects) */}
      {(project.materials !== "Non specificato" || project.focusElements !== "Non specificato" || project.visualDirection !== "Non specificato") && (
        <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A880] mb-4">04 // Linee Guida</h2>
            <h3 className="text-3xl md:text-5xl font-serif text-white">Direzione Progettuale</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {project.visualDirection && project.visualDirection !== "Non specificato" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 shadow-sm text-center backdrop-blur-sm"
              >
                <h3 className="font-serif text-xl mb-4 text-[#C5A880]">Stile Visivo</h3>
                <p className="text-zinc-400 font-light leading-relaxed">{project.visualDirection}</p>
              </motion.div>
            )}
            {project.materials && project.materials !== "Non specificato" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 shadow-sm text-center backdrop-blur-sm"
              >
                <h3 className="font-serif text-xl mb-4 text-[#C5A880]">Materiali</h3>
                <p className="text-zinc-400 font-light leading-relaxed">{project.materials}</p>
              </motion.div>
            )}
            {project.focusElements && project.focusElements !== "Non specificato" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 shadow-sm text-center backdrop-blur-sm"
              >
                <h3 className="font-serif text-xl mb-4 text-[#C5A880]">Elementi Chiave</h3>
                <p className="text-zinc-400 font-light leading-relaxed">{project.focusElements}</p>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Focus Areas (only if available) */}
      {hasFocusAreas && (
        <section className="py-24 md:py-32 bg-[#050505] border-y border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="mb-20">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A880] mb-4">05 // Dettagli</h2>
              <h3 className="text-3xl md:text-5xl font-serif text-white">Punti Focali</h3>
            </div>
            <div className="space-y-24 md:space-y-32">
              {data.focusAreas.map((focus: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center relative`}
                >
                  {/* Giant Background Number Watermark */}
                  <div className={`absolute top-1/2 -translate-y-1/2 ${idx % 2 !== 0 ? 'left-0 md:-left-12' : 'right-0 md:-right-12'} text-[12rem] md:text-[20rem] font-serif font-bold text-white/5 pointer-events-none z-0`}>
                    0{idx + 1}
                  </div>
                  
                  <div className="w-full md:w-1/2 aspect-[4/3] lg:aspect-[16/10] relative rounded-2xl overflow-hidden shadow-2xl z-10 group">
                    <Image src={focus.imageUrl} alt={focus.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                  <div className="w-full md:w-1/2 z-10 bg-[#050505]/80 backdrop-blur-sm p-4 md:p-8 rounded-2xl md:-ml-12 md:bg-transparent md:backdrop-blur-none">
                    <h3 className="text-2xl md:text-4xl font-serif mb-6 text-white leading-tight">{focus.title}</h3>
                    <p className="text-zinc-400 font-light text-lg leading-relaxed">{focus.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Proposal & CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-lg border border-[#C5A880]/30 rounded-[2rem] p-8 md:p-16 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#C5A880]/10 blur-3xl rounded-full pointer-events-none"></div>

          <h2 className="text-3xl md:text-5xl font-serif mb-6 text-white">Pronti a realizzare la visione?</h2>
          <p className="text-zinc-400 font-light text-lg mb-12 max-w-2xl mx-auto">Il progetto per {project.venueName} è stato studiato per massimizzare l'impatto sul tuo pubblico target. Siamo pronti per entrare nella fase esecutiva.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 text-left">
             <div className="p-8 bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A880]/5 blur-2xl rounded-full pointer-events-none"></div>
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-3">Investimento Stimato</span>
               <span className="text-3xl md:text-4xl font-serif text-white">{data.proposal?.totalEstimate || "In definizione"}</span>
             </div>
             <div className="p-8 bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A880]/5 blur-2xl rounded-full pointer-events-none"></div>
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-3">Tempistiche Stimate</span>
               <span className="text-3xl md:text-4xl font-serif text-white">{data.proposal?.timeline || "In definizione"}</span>
             </div>
          </div>

          <div className="flex justify-center print:hidden">
            <a href="mailto:info@artwoodarreda.com" className="group flex items-center justify-center px-10 py-5 bg-[#C5A880] text-black font-semibold uppercase tracking-widest text-sm rounded-full hover:bg-[#d4b78f] transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(197,168,128,0.2)]">
              <Mail className="mr-3 w-5 h-5 transition-transform group-hover:scale-110" />
              Contattaci Ora
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="py-12 text-center text-zinc-600 font-light text-sm border-t border-white/5 relative z-10">
        <p>© {new Date().getFullYear()} Artwoodarreda. Strategic Design Presentation per {project.clientName}.</p>
      </footer>

      {/* Planimetry Modal */}
      <AnimatePresence>
        {showPlanimetry && hasPlanimetry && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8" 
            onClick={() => setShowPlanimetry(false)}
          >
            <button 
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[101]"
              onClick={(e) => { e.stopPropagation(); setShowPlanimetry(false); }}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={data.planimetryImage} 
                alt="Planimetria Fullscreen" 
                decoding="async"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
