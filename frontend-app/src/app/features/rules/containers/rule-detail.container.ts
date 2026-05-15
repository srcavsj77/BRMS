import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { api } from '../../../shared/http/api';

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
        api.get(`/rules/${id}`),
        api.get(`/versions/${id}`),
        api.get(`/audits`),
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
      await api.post(`/rules/${this.rule.id}/versions/rollback`, { version, justification });
      // reload
      await this.load(this.rule.id);
      alert('Rollback efetuado com sucesso');
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    }
  }
}
