import type { Author, JourneyStep } from "@/types";

/**
 * AUTHOR CONTENT — verified information.
 *
 * Sources for the enriched details below (see /research/VERIFIED_FACTS.md):
 *  - The client's own professional biography (provided in the project brief)
 *  - The author's public LinkedIn profile (credentials, roles, missions,
 *    Mufulira United ownership, entrepreneurship mentoring)
 *  - Public clinical directories (WebMD, US News, MediFind, Wayne Memorial
 *    Hospital staff page) for practice facts
 *
 * Where public directories conflict (e.g. medical school), the site names no
 * institution rather than risk an error. Portrait photo still pending — the
 * designed monogram placeholder remains until a rights-cleared image exists.
 */
export const author: Author = {
  name: "Dr. Robert Sakulanda",
  shortName: "Robert",
  credentials: "MD, MBA, FAAFP, DABFM",
  roles: [
    "Family Medicine Physician",
    "Hospitalist",
    "Biotechnologist",
    "Author",
    "Scientist",
    "Father",
    "Immigrant",
  ],
  bio: "Dr. Robert Sakulanda, MD, MBA, FAAFP, DABFM, is a Zambian-born family medicine physician, hospitalist, biotechnologist, and author whose career bridges frontline patient care and scientific discovery. With more than two decades of clinical practice, he now cares for hospitalized patients in Georgia — and, after caring for critically ill patients during the COVID-19 pandemic, he earned a Master of Science in Applied Biotechnology from the University of Wisconsin–Madison, deepening his understanding of vaccines, gene editing, and emerging medical technologies. Beyond the ward, he is an entrepreneur and community builder: the owner of Mufulira United Football Club in Zambia, a mentor to young African entrepreneurs, and an advocate for healthier futures in the United States, Zambia, and around the world.",
  mission:
    "To practice medicine with humanity, pursue science with curiosity, and tell stories that connect people to a healthier future.",
  portrait: "/images/author/portrait.jpeg",
};

export const authorRolesForDisplay = author.roles.slice(0, 3); // Physician. Scientist. Author.

/**
 * THE JOURNEY — editorial chapters for the home-page storytelling section.
 * Each step is grounded in the client-provided background and the verified
 * public record (see /research/VERIFIED_FACTS.md).
 */
export const journey: JourneyStep[] = [
  {
    id: "medicine",
    title: "Medicine",
    caption: "Where it begins",
    narrative:
      "Robert's path began in Zambia and led to more than two decades of clinical practice — first in family medicine, learning to listen carefully across years and generations, then at the bedside as a hospitalist caring for patients through their most vulnerable moments.",
  },
  {
    id: "covid",
    title: "The Frontline",
    caption: "COVID-19",
    narrative:
      "When the pandemic arrived, he cared for critically ill patients on the front lines of COVID-19 in Georgia hospitals — an experience that reshaped his understanding of medicine, fragility, and human resilience.",
  },
  {
    id: "biotech",
    title: "Biotechnology",
    caption: "Master's studies",
    narrative:
      "The pandemic raised questions that medicine alone could not answer. He returned to graduate study and earned a Master of Science in Applied Biotechnology from the University of Wisconsin–Madison — studying vaccines, gene editing, and emerging medical technologies.",
  },
  {
    id: "science",
    title: "Scientific Exploration",
    caption: "Bench to bedside",
    narrative:
      "His work now lives at the junction of discovery and care — following how breakthroughs in the laboratory become treatments, and what they mean for real people and communities.",
  },
  {
    id: "writing",
    title: "Writing",
    caption: "Finding the words",
    narrative:
      "Medicine gave him stories; science gave him perspective. Writing became the way he carries both — translating the human experience of illness and hope into language everyone can share.",
  },
  {
    id: "purpose",
    title: "Purpose",
    caption: "The road ahead",
    narrative:
      "I wrote Behind the Mask because I couldn't carry what I saw in silence. During the pandemic, I was a physician at the bedside, trained in family medicine, hospital medicine, and critical care, holding the hands of frightened patients and answering questions from families when I didn't have easy answers. I went home exhausted, haunted by faces and conversations I couldn't set down. This book is how I finally started to set them down.\n\nSince then, I've gone back to school for my master's in biotechnology, and I've spent time in the world of vaccine production, where I saw how much careful, quiet work goes into protecting people. That's when I realized how wide the gap was between what I lived through in hospitals and what many people understood about the science. I wrote this book to close that gap, to share what it felt like on the frontline and to explain, in plain language, how vaccines are built and tested. If my story helps even one reader trade fear for understanding, then writing it was worth it.",
  },
];

/**
 * AREAS OF EXPERTISE — derived from the verified identity, credentials, and
 * public record. No invented credentials, institutions, or dates.
 */
export const expertiseAreas = [
  {
    title: "Family Medicine & Hospital Medicine",
    description:
      "More than two decades of clinical practice spanning primary care and hospital medicine — caring for patients in Georgia communities as a board-certified family physician (DABFM) and hospitalist, and a Fellow of the American Academy of Family Physicians (FAAFP).",
  },
  {
    title: "Biotechnology & Emerging Science",
    description:
      "Graduate training in applied biotechnology at the University of Wisconsin–Madison, with focused study of vaccines, gene editing, and the emerging medical technologies shaping tomorrow's care.",
  },
  {
    title: "Business & Healthcare Leadership",
    description:
      "An MBA and years of health-system experience inform his work as an entrepreneur — from building clinical teams to community investment, including ownership of Mufulira United Football Club in Zambia.",
  },
  {
    title: "Global Health & Mentorship",
    description:
      "Regular medical missions in Zambia and hands-on mentoring of young African entrepreneurs — a worldview shaped by communities in the United States, Zambia, and beyond, committed to broadening access to a healthier future.",
  },
];
