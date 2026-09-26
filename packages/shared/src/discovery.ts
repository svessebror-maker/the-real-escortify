/** Card fields for one recommendation in the discovery deck (build plan, Step 13). */
export type DiscoveryProfile = {
  id: string;
  name: string;
  role: string;
  institution: string;
  location: string;
  goal: string;
  topics: string[];
  offers: string[];
  needs: string[];
  /** Two user-readable matching reasons. */
  reasons: [string, string];
  availability: string;
  verified: boolean;
  /** Hue (0-360) for the avatar gradient until real photos exist. */
  hue: number;
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * Fictional profiles for previewing the deck before the discovery API exists.
 * Names and details are invented; no real people or photos.
 */
export const SAMPLE_PROFILES: DiscoveryProfile[] = [
  {
    id: "sample-1",
    name: "Amira Haddad",
    role: "PhD candidate · Computational linguistics",
    institution: "University of Edinburgh",
    location: "Edinburgh, UK",
    goal: "Looking for a coauthor",
    topics: ["NLP", "Low-resource languages", "Evaluation"],
    offers: ["PyTorch", "Annotation design"],
    needs: ["Statistics"],
    reasons: ["You're both looking for a coauthor", "2 shared NLP topics"],
    availability: "6 h/week · Remote",
    verified: true,
    hue: 262,
  },
  {
    id: "sample-2",
    name: "Jonas Lindqvist",
    role: "Postdoc · Climate science",
    institution: "Stockholm University",
    location: "Stockholm, Sweden",
    goal: "Recruiting a research assistant",
    topics: ["Climate models", "Remote sensing", "Open data"],
    offers: ["Satellite data", "Fortran"],
    needs: ["Web visualization"],
    reasons: ["They need web visualization, which you offer", "You both work with open data"],
    availability: "4 h/week · Hybrid",
    verified: true,
    hue: 196,
  },
  {
    id: "sample-3",
    name: "Priya Raman",
    role: "MSc student · Bioinformatics",
    institution: "ETH Zürich",
    location: "Zürich, Switzerland",
    goal: "Looking for a study partner",
    topics: ["Genomics", "Machine learning", "Protein folding"],
    offers: ["R", "Sequence analysis"],
    needs: ["Deep learning"],
    reasons: ["You're both preparing for ML exams", "She offers R, which you need"],
    availability: "5 h/week · Remote",
    verified: false,
    hue: 330,
  },
  {
    id: "sample-4",
    name: "Diego Morales",
    role: "Assistant professor · Human-computer interaction",
    institution: "Universidad de Chile",
    location: "Santiago, Chile",
    goal: "Offering mentorship",
    topics: ["Accessibility", "User research", "HCI"],
    offers: ["Study design", "Grant writing"],
    needs: ["Frontend prototyping"],
    reasons: ["You asked for a mentor in HCI", "3 shared accessibility topics"],
    availability: "2 h/week · Remote",
    verified: true,
    hue: 24,
  },
  {
    id: "sample-5",
    name: "Chen Wei",
    role: "Founder · Learning analytics startup",
    institution: "Tsinghua x-lab",
    location: "Beijing, China",
    goal: "Seeking a startup collaborator",
    topics: ["EdTech", "Learning analytics", "Data products"],
    offers: ["Product strategy", "Funding network"],
    needs: ["Mobile development"],
    reasons: ["They need mobile development, which you offer", "You're both into EdTech"],
    availability: "10 h/week · Remote",
    verified: false,
    hue: 150,
  },
  {
    id: "sample-6",
    name: "Sofia Papadopoulou",
    role: "Undergraduate · Economics",
    institution: "University of Athens",
    location: "Athens, Greece",
    goal: "Forming a hackathon team",
    topics: ["Behavioral economics", "Data visualization"],
    offers: ["Econometrics", "Pitching"],
    needs: ["Backend development"],
    reasons: ["The same hackathon is on both your calendars", "She offers econometrics, which you need"],
    availability: "Weekends · In person",
    verified: true,
    hue: 210,
  },
  {
    id: "sample-7",
    name: "Kwame Mensah",
    role: "PhD candidate · Materials science",
    institution: "KNUST",
    location: "Kumasi, Ghana",
    goal: "Looking for a grant partner",
    topics: ["Solar cells", "Materials simulation"],
    offers: ["DFT simulation", "Lab access"],
    needs: ["Data analysis"],
    reasons: ["You're both applying for energy research grants", "He offers lab access you need"],
    availability: "3 h/week · Remote",
    verified: true,
    hue: 42,
  },
  {
    id: "sample-8",
    name: "Lea Novak",
    role: "Research engineer · Robotics",
    institution: "University of Ljubljana",
    location: "Ljubljana, Slovenia",
    goal: "Offering an internship",
    topics: ["Robotics", "Computer vision", "ROS"],
    offers: ["Hardware lab", "C++"],
    needs: ["Computer vision"],
    reasons: ["Your computer vision skills match their internship", "2 shared robotics topics"],
    availability: "Full time · In person",
    verified: false,
    hue: 280,
  },
];
