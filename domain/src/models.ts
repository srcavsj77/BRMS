export const RuleStatus = {
  DRAFT: "DRAFT",
  VALIDATION: "VALIDATION",
  HOMOLOGATION: "HOMOLOGATION",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  OBSOLETE: "OBSOLETE",
} as const;

export type RuleStatus = typeof RuleStatus[keyof typeof RuleStatus];

export interface Rule {
  id: string;
  name: string;
  description: string;
  expression: string;
  category: string;
  status: RuleStatus;
  version: number;
  validFrom?: Date;
  validTo?: Date;
  owner: string;
  applications: string[];
  documents: string[];
}

export interface Document {
  id: string;
  title: string;
  type: "MANUAL" | "NORMA" | "PROCESSO";
  content: string;
  version: number;
  linkedRules: string[];
}

export interface Application {
  id: string;
  name: string;
  description: string;
  owner: string;
  linkedRules: string[];
}

export interface AuditLog {
  id: string;
  entity: "RULE" | "DOCUMENT" | "APPLICATION";
  entityId: string;
  action: "CREATE" | "UPDATE" | "STATUS_CHANGE";
  user: string;
  timestamp: Date;
  details: string;
}

export interface RuleVersion {
  ruleId: string;
  version: number;
  justification: string;
  createdAt: Date;
}

export interface Notice {
  id: string;
  title: string;
  description: string; // Máximo 100 caracteres no front
  dateTime: Date;
  responsible: string;
}

export interface SystemEntry {
  id: string;
  name: string;
  visits: number;
}
