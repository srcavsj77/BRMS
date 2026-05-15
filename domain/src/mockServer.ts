import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  RuleService,
  DocumentService,
  ApplicationService,
  AuditService,
  VersionService,
  NoticeService,
  ManagementSystemService,
  db,
} from "./services";
import { RuleStatus } from "./models";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (_req, res) => {
  res.type('html').send(`
    <html>
      <head><title>BRMS Mock API</title></head>
      <body style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
        <h1>BRMS Mock API</h1>
        <p>Endpoints disponíveis:</p>
        <ul>
          <li><a href="/rules">/rules</a> - lista de regras (GET)</li>
          <li><a href="/documents">/documents</a> - lista de documentos (GET)</li>
          <li><a href="/applications">/applications</a> - lista de aplicações (GET)</li>
          <li><a href="/audits">/audits</a> - logs de auditoria (GET) (aceita query params para paginação/filter)</li>
        </ul>
        <p>Consuma a API pelo frontend apontando 'API_BASE' para esta URL.</p>
      </body>
    </html>
  `);
});

app.get("/rules", (_req, res) => res.json(RuleService.list()));

app.get('/rules/:id', (req, res) => {
  try {
    const r = RuleService.get(req.params.id);
    if (!r) return res.status(404).json({ error: 'Rule not found' });
    res.json(r);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rules/:id/versions/rollback', (req, res) => {
  try {
    const { version, justification } = req.body || {};
    const id = req.params.id;
    const rule = RuleService.get(id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    if (typeof version !== 'number') return res.status(400).json({ error: 'version must be a number' });

    // perform rollback (mock): set rule.version and create a version record and audit log
    const updated = { ...rule, version };
    // update the rule in DB
    // Note: Using RuleService.update to keep audit/version hooks
    db.rules.set(id, updated);
    VersionService.create(id, justification || 'Rollback performed');
    AuditService.log('RULE', id, 'STATUS_CHANGE', 'system', `Rollback to v${version}: ${justification || ''}`);

    res.json({ ok: true, rule: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/rules", (req, res) => {
  try {
    const r = RuleService.create(req.body);
    res.status(201).json(r);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/rules/:id", (req, res) => {
  try {
    const updated = RuleService.update(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.post("/rules/:id/status", (req, res) => {
  try {
    const status = req.body.status as RuleStatus;
    const updated = RuleService.changeStatus(req.params.id, status);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/documents", (_req, res) => res.json(DocumentService.list()));
app.post("/documents", (req, res) => {
  try {
    const d = DocumentService.create(req.body);
    res.status(201).json(d);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/applications", (_req, res) => res.json(ApplicationService.list()));
app.post("/applications", (req, res) => {
  try {
    const a = ApplicationService.create(req.body);
    res.status(201).json(a);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/audits", (req, res) => {
  const { page = '1', pageSize = '20', entity, entityId, action, user } = req.query;
  let items = AuditService.list();

  if (entity) items = items.filter((i) => i.entity === String(entity));
  if (entityId) items = items.filter((i) => i.entityId === String(entityId));
  if (action) items = items.filter((i) => i.action === String(action));
  if (user) items = items.filter((i) => i.user === String(user));

  const p = Math.max(1, parseInt(String(page), 10) || 1);
  const ps = Math.max(1, parseInt(String(pageSize), 10) || 20);
  const start = (p - 1) * ps;
  const paged = items.slice(start, start + ps);

  res.json({ items: paged, total: items.length, page: p, pageSize: ps });
});

app.get("/versions/:ruleId", (req, res) =>
  res.json(VersionService.list(req.params.ruleId))
);

// Notices
app.get("/notices", (_req, res) => res.json(NoticeService.list()));
app.post("/notices", (req, res) => {
  try {
    const n = NoticeService.create(req.body);
    res.status(201).json(n);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/notices/:id", (req, res) => {
  NoticeService.delete(req.params.id);
  res.status(204).send();
});

// Management Systems (Dashboard)
app.get("/systems", (_req, res) => res.json(ManagementSystemService.list()));
app.post("/systems", (req, res) => {
  try {
    const s = ManagementSystemService.create(req.body);
    res.status(201).json(s);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/systems/:id", (req, res) => {
  ManagementSystemService.delete(req.params.id);
  res.status(204).send();
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;
export function startServer() {
  return app.listen(PORT, () =>
    // eslint-disable-next-line no-console
    console.log(`BRMS mock API listening on http://localhost:${PORT}`)
  );
}

const _isRunDirectly = process.argv[1] && (process.argv[1].endsWith('mockServer.ts') || process.argv[1].endsWith('mockServer.js'));

if (_isRunDirectly || process.env.START_MOCK === "1") startServer();
