/**
 * @file src/lib/workspace-defaults.ts
 * Curated high-resolution dummy content and imagery for franchise workspaces
 * whenever live records are not yet populated in the database.
 */

export const DEFAULT_WORKSPACE_GALLERY = [
  {
    id: "dummy-gal-1",
    title: "Modern AI & Computer Research Lab",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=1200",
    category: "Academic Labs",
    createdAt: new Date().toISOString()
  },
  {
    id: "dummy-gal-2",
    title: "Interactive Smart Classroom Session",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200",
    category: "Campus Life",
    createdAt: new Date().toISOString()
  },
  {
    id: "dummy-gal-3",
    title: "Annual Tech Innovation Fest",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200",
    category: "Events & Fests",
    createdAt: new Date().toISOString()
  },
  {
    id: "dummy-gal-4",
    title: "Graduation & Degree Award Ceremony",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200",
    category: "Convocation",
    createdAt: new Date().toISOString()
  },
  {
    id: "dummy-gal-5",
    title: "Collaborative Student Study Lounge",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",
    category: "Campus Life",
    createdAt: new Date().toISOString()
  },
  {
    id: "dummy-gal-6",
    title: "Central Digital Library & Research Center",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200",
    category: "Academic Labs",
    createdAt: new Date().toISOString()
  },
  {
    id: "dummy-gal-7",
    title: "Inter-College Robotics Competition",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200",
    category: "Events & Fests",
    createdAt: new Date().toISOString()
  },
  {
    id: "dummy-gal-8",
    title: "Annual Sports & Athletics Meet",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200",
    category: "Sports",
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_WORKSPACE_NOTICES = [
  {
    title: "Semester Examination Schedule 2026 Released",
    date: "12 Oct, 2026",
    link: "#",
    category: "Exams"
  },
  {
    title: "Admissions Open for Summer Diploma & Certificate Batches",
    date: "08 Oct, 2026",
    link: "#",
    category: "Admissions"
  },
  {
    title: "Campus Recruitment Drive - Top Hiring Partners",
    date: "05 Oct, 2026",
    link: "#",
    category: "Placement"
  },
  {
    title: "Merit-Based Scholarship Application Portal Now Live",
    date: "01 Oct, 2026",
    link: "#",
    category: "Scholarship"
  }
];
