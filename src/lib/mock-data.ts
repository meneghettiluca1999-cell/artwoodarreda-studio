export interface Project {
  id: string;
  name: string;
  clientName: string;
  venueName: string;
  location: string;
  type: string;
  sizeSqM: number;
  seatingCapacity: number;
  status: 'new' | 'restyling' | 'expansion';
  budget: string;
  targetAudience: string;
  positioning: string;
  goals: string;
  visualDirection: string;
  materials: string;
  focusElements: string;
  notes: string;
  password: string;
  presentation?: PresentationData;
  customReport?: {
    atmosphereInsight?: string;
    wowPoints?: string[];
    competitorStrategy?: string;
  };
}

export interface PresentationData {
  heroImage: string;
  conceptText: string;
  vision: {
    goals: string[];
    atmosphere: string;
    direction: string;
  };
  planimetryImage: string;
  moodboardImages: { url: string; tag: string }[];
  inspirations: { url: string; caption: string; relevance: string }[];
  focusAreas: { title: string; description: string; imageUrl: string }[];
  proposal: {
    totalEstimate: string;
    timeline: string;
  };
}

export interface EnrichedCompetitor {
  id: string;
  name: string;
  type: string;
  distance: number;
  threatLevel: 'high' | 'medium' | 'low';
  proximityZone: string;
  typeMatch: 'direct' | 'indirect' | 'adjacent';
  estimatedRating: number | null;
  estimatedReviews: number | null;
  priceLevel: string | null;
}

/** Generate a random alphanumeric password */
export function generatePassword(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const mockProjects: Project[] = [
  {
    id: "P-1001",
    name: "Lumina Bistro",
    clientName: "Marco Rossi",
    venueName: "Lumina",
    location: "Milano, Brera",
    type: "Bistro, Cocktail Bar",
    sizeSqM: 120,
    seatingCapacity: 45,
    status: 'new',
    budget: "150.000 - 200.000 €",
    targetAudience: "Professionisti, 25-45 anni, design conscious",
    positioning: "Premium Casual",
    goals: "Creare un'atmosfera vibrante ma elegante per l'aperitivo e la cena. Locale che vive anche di giorno.",
    visualDirection: "Minimalista contemporaneo con tocchi mid-century",
    materials: "Noce canaletto, ottone, marmo Verde Alpi, vetro",
    focusElements: "Banco bar, illuminazione integrata, bottigliera",
    notes: "Grande attenzione all'illuminazione. Vogliono un banco bar scenografico.",
    password: "Lum2025",
    presentation: {
      heroImage: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop",
      conceptText: "Un bistrot contemporaneo dove la luce diventa materia. Superfici calde in noce incontrano dettagli in ottone e marmo verde, creando un'esperienza immersiva che evolve dal giorno alla notte.",
      vision: {
        goals: ["Atmosfera cosmopolita", "Focus sul banco bar", "Illuminazione dinamica"],
        atmosphere: "Accogliente, sofisticata, vibrante.",
        direction: "Contemporary Mid-Century"
      },
      planimetryImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      moodboardImages: [
        { url: "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=2070&auto=format&fit=crop", tag: "Calore" },
        { url: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=1974&auto=format&fit=crop", tag: "Materiali Premium" },
        { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1974&auto=format&fit=crop", tag: "Ottone & Vetro" },
        { url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop", tag: "Marmo Verde" }
      ],
      inspirations: [
        { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop", caption: "Luci soffuse", relevance: "Perfetto per l'atmosfera serale." },
        { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop", caption: "Banco Bar Protagonista", relevance: "Il banco diventa il palcoscenico." }
      ],
      focusAreas: [
        { title: "Il Banco Bar", description: "Rivestito in listelli di noce canaletto con piano in marmo Verde Alpi.", imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17ce6d?q=80&w=2070&auto=format&fit=crop" },
        { title: "Illuminazione Integrata", description: "Sistemi LED nascosti per valorizzare le texture e creare intimità.", imageUrl: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=1974&auto=format&fit=crop" }
      ],
      proposal: {
        totalEstimate: "185.000 €",
        timeline: "12 Settimane"
      }
    }
  }
];
