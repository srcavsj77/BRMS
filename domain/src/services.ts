import { randomUUID } from "crypto";
import { RuleStatus } from "./models";
import type {
  Rule,
  Document,
  Application,
  AuditLog,
  RuleVersion,
  Notice,
  SystemEntry,
} from "./models";

const db = {
  rules: new Map<string, Rule>(),
  documents: new Map<string, Document>(),
  applications: new Map<string, Application>(),
  audits: new Map<string, AuditLog>(),
  notices: new Map<string, Notice>(),
  systemEntries: new Map<string, SystemEntry>(),
};

const generateId = () => randomUUID();

// Mock Initial Data
const initialNotices: Omit<Notice, "id">[] = [
  { title: "Atualização do Motor de Regras", description: "Melhorias de desempenho e novos operadores lógicos.", dateTime: new Date("2026-03-15T09:00:00"), responsible: "admin" },
  { title: "Nova política de conformidade FGV", description: "Alinhamento com as diretrizes do Banco Central.", dateTime: new Date("2026-03-12T14:30:00"), responsible: "compliance" },
  { title: "Manutenção programada - Sábado", description: "Indisponibilidade temporária do portal para atualização de banco.", dateTime: new Date("2026-03-10T22:00:00"), responsible: "infra" },
];

const initialSystems: Omit<SystemEntry, "id">[] = [
  { name: "Portal Normativo", visits: 1240 },
  { name: "Gestão de Riscos", visits: 850 },
  { name: "Repositório de Auditoria", visits: 600 },
];

export class NoticeService {
  static init() {
    if (db.notices.size === 0) {
      initialNotices.forEach(n => this.create(n));
    }
  }

  static create(notice: Omit<Notice, "id">): Notice {
    const dateTime = typeof notice.dateTime === 'string' ? new Date(notice.dateTime) : notice.dateTime;
    const newNotice: Notice = { ...notice, dateTime, id: generateId() };
    db.notices.set(newNotice.id, newNotice);
    return newNotice;
  }

  static list(): Notice[] {
    return Array.from(db.notices.values()).sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());
  }

  static delete(id: string) {
    db.notices.delete(id);
  }
}

export class ManagementSystemService {
  static init() {
    if (db.systemEntries.size === 0) {
      initialSystems.forEach(s => this.create(s));
    }
  }

  static create(system: Omit<SystemEntry, "id">): SystemEntry {
    const newSystem: SystemEntry = { ...system, id: generateId() };
    db.systemEntries.set(newSystem.id, newSystem);
    return newSystem;
  }

  static list(): SystemEntry[] {
    return Array.from(db.systemEntries.values()).sort((a,b) => b.visits - a.visits);
  }

  static delete(id: string) {
    db.systemEntries.delete(id);
  }
}

// Initialize
NoticeService.init();
ManagementSystemService.init();

export class AuditService {
  static log(
    entity: AuditLog["entity"],
    entityId: string,
    action: AuditLog["action"],
    user: string,
    details = ""
  ) {
    const log: AuditLog = {
      id: generateId(),
      entity,
      entityId,
      action,
      user,
      timestamp: new Date(),
      details,
    };

    db.audits.set(log.id, log);
  }

  static list(): AuditLog[] {
    return Array.from(db.audits.values());
  }
}

export class VersionService {
  private static versions: RuleVersion[] = [];

  static create(ruleId: string, justification: string) {
    const rule = db.rules.get(ruleId);
    if (!rule) return;

    this.versions.push({
      ruleId,
      version: rule.version,
      justification,
      createdAt: new Date(),
    });
  }

  static list(ruleId: string): RuleVersion[] {
    return this.versions.filter((v) => v.ruleId === ruleId);
  }
}

export class RuleService {
  static create(rule: Omit<Rule, "id" | "version" | "status">): Rule {
    const newRule: Rule = {
      ...rule,
      id: generateId(),
      version: 1,
      status: RuleStatus.DRAFT,
    };

    db.rules.set(newRule.id, newRule);
    AuditService.log("RULE", newRule.id, "CREATE", "system");
    return newRule;
  }

  static update(id: string, updates: Partial<Rule>): Rule {
    const existing = db.rules.get(id);
    if (!existing) throw new Error("Rule not found");

    const updated: Rule = {
      ...existing,
      ...updates,
      version: existing.version + 1,
    };

    db.rules.set(id, updated);
    VersionService.create(id, "Update performed");
    AuditService.log("RULE", id, "UPDATE", "system");

    return updated;
  }

  static changeStatus(id: string, status: RuleStatus): Rule {
    const rule = db.rules.get(id);
    if (!rule) throw new Error("Rule not found");

    const updated = { ...rule, status };
    db.rules.set(id, updated);

    AuditService.log("RULE", id, "STATUS_CHANGE", "system");
    return updated;
  }

  static list(): Rule[] {
    return Array.from(db.rules.values());
  }

  static get(id: string): Rule | undefined {
    return db.rules.get(id);
  }
}

export class DocumentService {
  static create(doc: Omit<Document, "id" | "version">): Document {
    const newDoc: Document = {
      ...doc,
      id: generateId(),
      version: 1,
    };

    db.documents.set(newDoc.id, newDoc);
    AuditService.log("DOCUMENT", newDoc.id, "CREATE", "system");
    return newDoc;
  }

  static list(): Document[] {
    return Array.from(db.documents.values());
  }
}

export class ApplicationService {
  static create(app: Omit<Application, "id">): Application {
    const newApp: Application = {
      ...app,
      id: generateId(),
    };

    db.applications.set(newApp.id, newApp);
    AuditService.log("APPLICATION", newApp.id, "CREATE", "system");
    return newApp;
  }

  static list(): Application[] {
    return Array.from(db.applications.values());
  }
}

export const _internal = { db };
export { db };
