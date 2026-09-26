export interface FunnelFieldConfig {
  showEmail: boolean;
  requireEmail: boolean;
  showPinCode: boolean;
  requirePinCode: boolean;
  showCity: boolean;
  requireCity: boolean;
  showState: boolean;
}

export interface FunnelQuestionOption {
  label: string;
}

export interface FunnelQuestion {
  id: string;
  question: string;
  options: FunnelQuestionOption[];
}

export interface FunnelRedirectionConfig {
  franchiseUrl: string;
  studentUrl: string;
  autoNearestCenter: boolean;
}

export interface FunnelConfig {
  visitorTitle?: string;
  visitorSubtitle?: string;
  fields: FunnelFieldConfig;
  franchiseQuestions: FunnelQuestion[];
  studentQuestions: FunnelQuestion[];
  redirection: FunnelRedirectionConfig;
  popupEnabled: boolean;
}

export const DEFAULT_FRANCHISE_QUESTIONS: FunnelQuestion[] = [
  {
    id: "background",
    question: "What is your current profession or background?",
    options: [
      { label: "Computer Center / Institute Owner" },
      { label: "Educator / School Teacher" },
      { label: "IT / Tech Professional" },
      { label: "Aspiring Entrepreneur" },
    ]
  },
  {
    id: "infrastructure",
    question: "What is your computer lab capacity?",
    options: [
      { label: "10 - 20 Computer Systems" },
      { label: "5 - 10 Computer Systems" },
      { label: "25+ High-Capacity Systems" },
      { label: "Setting up a brand-new facility" },
    ]
  },
  {
    id: "timeline",
    question: "When are you planning to affiliate?",
    options: [
      { label: "Immediately (This Month)" },
      { label: "Within 30 to 60 Days" },
      { label: "Exploring details & proposals" },
    ]
  }
];

export const DEFAULT_STUDENT_QUESTIONS: FunnelQuestion[] = [
  {
    id: "qualification",
    question: "What is your educational qualification?",
    options: [
      { label: "10th Standard / Matric Pass" },
      { label: "12th Standard / Higher Secondary" },
      { label: "College Student / Under-Graduate" },
      { label: "Graduate / Working Professional" },
    ]
  },
  {
    id: "course_interest",
    question: "Which career field are you interested in?",
    options: [
      { label: "ADCA / DCA (Computer Applications)" },
      { label: "Web & Software Development" },
      { label: "Accounting & GST (Tally Prime)" },
      { label: "Hardware, Networking & IT Support" },
    ]
  },
  {
    id: "batch_timing",
    question: "What is your preferred class schedule?",
    options: [
      { label: "Morning Session (9 AM - 12 PM)" },
      { label: "Afternoon Session (12 PM - 3 PM)" },
      { label: "Evening Session (3 PM - 7 PM)" },
      { label: "Weekend Batches (Sat - Sun)" },
    ]
  }
];

export const DEFAULT_FUNNEL_CONFIG: FunnelConfig = {
  visitorTitle: "Quick Admission & Franchise Check",
  visitorSubtitle: "Get instant eligibility, fee details & certified center info in 30 seconds.",
  fields: {
    showEmail: true,
    requireEmail: false,
    showPinCode: true,
    requirePinCode: true,
    showCity: true,
    requireCity: false,
    showState: false,
  },
  franchiseQuestions: DEFAULT_FRANCHISE_QUESTIONS,
  studentQuestions: DEFAULT_STUDENT_QUESTIONS,
  redirection: {
    franchiseUrl: "/franchises/apply",
    studentUrl: "/nearest-center",
    autoNearestCenter: true,
  },
  popupEnabled: true,
};

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  organization?: string;
  workspaceId?: string | null;
  honeypot?: string;
  formRenderTime?: number;
}

export interface CampaignLeadInput {
  name: string;
  phone: string;
  email?: string;
  pinCode?: string;
  city?: string;
  state?: string;
  campaignType: "FRANCHISE" | "STUDENT";
  socialSource?: string;
  answers?: Record<string, string>;
  workspaceId?: string | null;
  honeypot?: string;
  formRenderTime?: number;
}

