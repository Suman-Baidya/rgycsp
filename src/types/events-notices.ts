export type NoticeItem = {
  id: string;
  title: string;
  message?: string;
  date: string;
  link?: string;
  audience: "ALL" | "PUBLIC" | "STUDENTS" | "STAFF" | "ALL_FRANCHISES" | "SPECIFIC_FRANCHISE";
  priority: "NORMAL" | "HIGH" | "URGENT";
  isActive: boolean;
  publishedBy?: string;
  targetWorkspaceId?: string | null;
  createdAt: string;
  refNo?: string | null;
  scheduledFor?: string | null;
  status?: "PUBLISHED" | "SCHEDULED" | "DRAFT";
  templateId?: string | null;
  category?: string | null;
  workspace?: any | null;
  target?: string | null;
  targetAudience?: string | null;
  isHeadOffice?: boolean | null;
};

export type NoticeRetentionConfig = {
  autoCleanEnabled: boolean;
  retentionDays: number;
  cleanTargets: ("CIRCULAR" | "CENTER_NOTICE" | "READ_NOTIFICATION")[];
  lastCleanedAt?: string | null;
  lastCleanedCount?: number;
};
