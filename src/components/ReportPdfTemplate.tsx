import React from 'react';
import { Project, EnrichedCompetitor } from '@/lib/mock-data';
import { MapPin, Building2, Target, Users, Palette, StickyNote } from 'lucide-react';

interface ReportPdfTemplateProps {
  project: Project;
  competitors: EnrichedCompetitor[];
  atmosphereInsight: string;
  wowPoints: string[];
  competitorStrategy: string;
}

export const ReportPdfTemplate = React.forwardRef<HTMLDivElement, ReportPdfTemplateProps>(({
  project,
  competitors,
  atmosphereInsight,
  wowPoints,
  competitorStrategy
}, ref) => {
  return (
    <div 
      ref={ref} 
      // Usiamo dimensioni fisse A4 per garantire un rendering consistente (210mm x 297mm approx 794px x 1123px a 96dpi)
      // ma per html2pdf va bene anche una larghezza fissa in px e altezza automatica.
      className="bg-white text-stone-900 absolute -left-[9999px] top-0 w-[800px] print-container"
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Cover Page */}
      <div className="pdf-page w-full h-[1123px] flex flex-col justify-between p-12 bg-stone-50 border-b-8 border-[#C5A880] relative overflow-hidden" data-html2canvas-ignore="false">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A880] opacity-10 rounded-bl-full" />
        <div className="absolute bottom-32 left-0 w-48 h-48 bg-[#C5A880] opacity-5 rounded-tr-full" />

        <div className="z-10 mt-4">
          <img src="/logo-artwood.png" alt="Artwoodarreda Logo" className="h-10 mb-12 object-contain" />
          <div className="text-[#C5A880] font-bold tracking-widest uppercase text-sm mb-4">Strategic Report</div>
          <h1 className="text-5xl font-serif font-light text-stone-900 leading-tight mb-6">
            Strategic<br />
            Intelligence<br />
            Report
          </h1>
          <div className="w-16 h-1 bg-[#C5A880] mb-8" />
        </div>

        <div className="z-10 mb-12">
          <h2 className="text-3xl font-serif text-stone-800 mb-2">{project.name}</h2>
          <p className="text-stone-500 text-lg">{project.venueName} • {project.location}</p>
          
          <div className="mt-12 pt-8 border-t border-stone-200">
            <p className="text-sm uppercase tracking-wider text-stone-400 mb-1">Preparato per</p>
            <p className="text-xl text-stone-800">{project.clientName}</p>
          </div>
        </div>
      </div>

      {/* Page Break */}
      <div className="html2pdf__page-break"></div>

      {/* Project Overview Page */}
      <div className="pdf-page w-full h-[1123px] p-12 bg-white relative">
        <div className="text-[#C5A880] text-xs uppercase tracking-widest mb-12 font-semibold flex justify-between">
          <span>01. Project Overview</span>
          <span className="text-stone-300">Artwoodarreda Studio</span>
        </div>
        
        <h2 className="text-3xl font-serif text-stone-900 mb-8">Executive Summary</h2>
        
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="p-6 bg-stone-50 rounded-lg border-l-4 border-[#C5A880]">
            <p className="text-xs uppercase tracking-wider text-stone-500 mb-2 flex items-center"><Building2 className="w-3 h-3 mr-2" /> Tipologia</p>
            <p className="font-medium text-stone-900">{project.type}</p>
          </div>
          <div className="p-6 bg-stone-50 rounded-lg border-l-4 border-[#C5A880]">
            <p className="text-xs uppercase tracking-wider text-stone-500 mb-2 flex items-center"><MapPin className="w-3 h-3 mr-2" /> Location</p>
            <p className="font-medium text-stone-900">{project.location}</p>
          </div>
          <div className="p-6 bg-stone-50 rounded-lg border-l-4 border-[#C5A880]">
            <p className="text-xs uppercase tracking-wider text-stone-500 mb-2 flex items-center"><Target className="w-3 h-3 mr-2" /> Dimensioni</p>
            <p className="font-medium text-stone-900">{project.sizeSqM ? `${project.sizeSqM} mq` : 'Da definire'}</p>
          </div>
          <div className="p-6 bg-stone-50 rounded-lg border-l-4 border-[#C5A880]">
            <p className="text-xs uppercase tracking-wider text-stone-500 mb-2 flex items-center"><Users className="w-3 h-3 mr-2" /> Posti a Sedere</p>
            <p className="font-medium text-stone-900">{project.seatingCapacity ? `${project.seatingCapacity}` : 'Da definire'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-serif text-stone-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-3 text-[#C5A880]" /> Target & Posizionamento
          </h3>
          <p className="text-stone-600 leading-relaxed bg-stone-50 p-6 rounded-lg mb-4">
            <strong className="text-stone-900">Pubblico:</strong> {project.targetAudience}<br/>
            <strong className="text-stone-900 mt-2 inline-block">Fascia:</strong> {project.positioning}
            {project.goals && project.goals !== "Non specificato" && (
              <><br/><strong className="text-stone-900 mt-2 inline-block">Obiettivi:</strong> {project.goals}</>
            )}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-serif text-stone-800 mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-3 text-[#C5A880]" /> Direzione Visiva & Materiali
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
             <p className="text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-lg text-sm">
                <strong className="text-stone-900 block mb-1">Stile & Mood</strong>
                {project.visualDirection}
             </p>
             <p className="text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-lg text-sm">
                <strong className="text-stone-900 block mb-1">Materiali Focus</strong>
                {project.materials}
             </p>
             <p className="text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-lg text-sm">
                <strong className="text-stone-900 block mb-1">Elementi Chiave</strong>
                {project.focusElements}
             </p>
          </div>
          
          {project.notes && (
            <div className="mt-6">
              <h3 className="text-xl font-serif text-stone-800 mb-4 flex items-center">
                <StickyNote className="w-5 h-5 mr-3 text-[#C5A880]" /> Note Private Consulente
              </h3>
              <p className="text-stone-600 leading-relaxed bg-[#C5A880]/10 p-6 rounded-lg italic border border-[#C5A880]/30">
                "{project.notes}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Page Break */}
      <div className="html2pdf__page-break"></div>

      {/* AI Insights & Strategy */}
      <div className="pdf-page w-full h-[1123px] p-12 bg-white relative">
        <div className="text-[#C5A880] text-xs uppercase tracking-widest mb-12 font-semibold flex justify-between">
          <span>02. Strategic Insights</span>
          <span className="text-stone-300">Artwoodarreda Studio</span>
        </div>
        
        <h2 className="text-3xl font-serif text-stone-900 mb-8">Direzione Consigliata</h2>

        <div className="bg-[#C5A880]/10 p-8 rounded-xl mb-10 border border-[#C5A880]/30">
          <h3 className="text-xl font-serif text-stone-900 mb-4">Atmosfera & Concept</h3>
          <p className="text-stone-700 leading-relaxed text-lg">
            {atmosphereInsight}
          </p>
        </div>

        <h3 className="text-xl font-serif text-stone-900 mb-6">Punti Wow (Opportunità)</h3>
        <div className="space-y-4 mb-12">
          {wowPoints.slice(0, 3).map((point, idx) => (
            <div key={idx} className="flex items-start bg-stone-50 p-5 rounded-lg border-l-2 border-[#C5A880]">
              <span className="text-[#C5A880] font-bold mr-4 mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
              <p className="text-stone-700">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Continuazione Punti Wow se superano i 3 elementi */}
      {wowPoints.length > 3 && (
        <>
          <div className="html2pdf__page-break"></div>
          <div className="pdf-page w-full h-[1123px] p-12 bg-white relative">
            <div className="text-[#C5A880] text-xs uppercase tracking-widest mb-12 font-semibold flex justify-between">
              <span>02. Strategic Insights (Cont.)</span>
              <span className="text-stone-300">Artwoodarreda Studio</span>
            </div>
            
            <h3 className="text-xl font-serif text-stone-900 mb-6">Punti Wow (Continuazione)</h3>
            <div className="space-y-4 mb-12">
              {wowPoints.slice(3, 8).map((point, idx) => (
                <div key={idx + 3} className="flex items-start bg-stone-50 p-5 rounded-lg border-l-2 border-[#C5A880]">
                  <span className="text-[#C5A880] font-bold mr-4 mt-0.5">{String(idx + 4).padStart(2, '0')}</span>
                  <p className="text-stone-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Page Break */}
      <div className="html2pdf__page-break"></div>

      {/* Competitor Analysis */}
      <div className="pdf-page w-full h-[1123px] p-12 relative" style={{ backgroundColor: '#1c1917', color: '#f5f5f4' }}>
        <div className="text-[#C5A880] text-xs uppercase tracking-widest mb-12 font-semibold flex justify-between">
          <span>03. Market Intelligence</span>
          <span style={{ color: '#78716c' }}>Artwoodarreda Studio</span>
        </div>
        
        <h2 className="text-3xl font-serif mb-8" style={{ color: '#ffffff' }}>Analisi Competitor</h2>

        <div className="p-8 rounded-xl mb-10 border" style={{ backgroundColor: '#292524', borderColor: '#44403c' }}>
          <h3 className="text-[#C5A880] font-medium mb-3 uppercase tracking-wider text-sm">Spunto Strategico</h3>
          <p className="leading-relaxed text-lg" style={{ color: '#d6d3d1' }}>
            {competitorStrategy}
          </p>
        </div>

        {competitors && competitors.length > 0 && (
          <div>
             <h3 className="text-xl font-serif mb-6" style={{ color: '#ffffff' }}>Landscape (Raggio 5km)</h3>
             <div className="grid grid-cols-1 gap-4">
                {competitors.slice(0, 8).map(comp => (
                  <div key={comp.id} className="flex justify-between items-center border-b pb-4" style={{ borderColor: '#44403c' }}>
                    <div>
                      <div className="font-medium flex items-center" style={{ color: '#ffffff' }}>
                        {comp.name}
                        {comp.threatLevel === 'high' && <span className="ml-2 w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }}></span>}
                      </div>
                      <div className="text-sm mt-1" style={{ color: '#a8a29e' }}>{comp.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#C5A880] font-medium">{(comp.distance / 1000).toFixed(1)} km</div>
                      <div className="text-xs mt-1" style={{ color: '#78716c' }}>{comp.proximityZone}</div>
                    </div>
                  </div>
                ))}
             </div>
             {competitors.length > 8 && (
                <div className="mt-4 text-center text-sm italic" style={{ color: '#78716c' }}>
                  + altri {competitors.length - 8} competitor analizzati
                </div>
             )}
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-12 left-12 right-12 border-t pt-6 flex justify-between items-center" style={{ borderColor: '#44403c' }}>
          <div className="text-sm" style={{ color: '#78716c' }}>Artwoodarreda Studio</div>
          <div className="text-sm" style={{ color: '#78716c' }}>{new Date().toLocaleDateString('it-IT')}</div>
        </div>
      </div>
      
    </div>
  );
});

ReportPdfTemplate.displayName = 'ReportPdfTemplate';
