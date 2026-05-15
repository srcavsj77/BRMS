import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rule-detail',
  template: `
    <div *ngIf="rule; else loading">
      <h2>{{ rule.name }}</h2>
      <p>{{ rule.description }}</p>

      <section>
        <h3>Versões</h3>
        <app-rule-versions [versions]="versions" (rollback)="onRollback($event)"></app-rule-versions>
      </section>

      <section>
        <h3>Auditoria</h3>
        <app-rule-audit [audits]="audits"></app-rule-audit>
      </section>
    </div>
    <ng-template #loading>
      <p>Carregando...</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleDetailContainer {
  rule: any | null = null;
  versions: any[] = [];
  audits: any[] = [];

  constructor(private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  async load(id: string) {
    try {
      const [r, vs, allAudits] = await Promise.all([
        fetch(`http://localhost:3334/rules/${id}`).then((s) => s.json()),
        fetch(`http://localhost:3334/versions/${id}`).then((s) => s.json()),
        fetch(`http://localhost:3334/audits`).then((s) => s.json()),
      ]);

      this.rule = r;
      this.versions = vs || [];
      this.audits = (allAudits || []).filter((a: any) => a.entity === 'RULE' && a.entityId === id);
    } catch (e) {
      console.error(e);
    }
  }

  async onRollback(version: number) {
    const justification = window.prompt('Justificativa para rollback (opcional):', '');
    if (!confirm(`Confirma rollback para a versão ${version}?`)) return;

    try {
      const res = await fetch(`http://localhost:3334/rules/${this.rule.id}/versions/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, justification })
      });
      if (!res.ok) throw new Error('Rollback falhou');
      // reload
      await this.load(this.rule.id);
      alert('Rollback efetuado com sucesso');
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    }
  }
}
