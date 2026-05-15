import { Component, ChangeDetectionStrategy } from '@angular/core';
import { API_BASE } from '../core/api';
import { api } from '../shared/http/api';

@Component({
  selector: 'app-audit',
  template: `
    <h2>Auditoria</h2>
    <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px">
      <input placeholder="Usuário" [(ngModel)]="filters.user" />
      <input placeholder="Ação" [(ngModel)]="filters.action" />
      <select [(ngModel)]="filters.entity">
        <option value="">Todos</option>
        <option value="RULE">RULE</option>
        <option value="DOCUMENT">DOCUMENT</option>
        <option value="APPLICATION">APPLICATION</option>
      </select>
      <button mat-button (click)="load()">Filtrar</button>
    </div>

    <div *ngIf="items?.length; else empty">
      <mat-card *ngFor="let a of items">
        <mat-card-title>{{ a.entity }} - {{ a.action }}</mat-card-title>
        <mat-card-content>
          <div>{{ a.user }} • {{ a.timestamp }}</div>
          <div>{{ a.details }}</div>
        </mat-card-content>
      </mat-card>

      <div style="display:flex; gap:8px; margin-top:12px; align-items:center">
        <button mat-button (click)="prev()" [disabled]="page<=1">Anterior</button>
        <span>Página {{page}} / {{ totalPages }}</span>
        <button mat-button (click)="next()" [disabled]="page>=totalPages">Próxima</button>
      </div>
    </div>

    <ng-template #empty>
      <p>Nenhum resultado</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditComponent {
  items: any[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  totalPages = 1;
  filters: any = { user: '', action: '', entity: '' };

  constructor() {
    this.load();
  }

  async load() {
    const params = new URLSearchParams();
    params.set('page', String(this.page));
    params.set('pageSize', String(this.pageSize));
    if (this.filters.user) params.set('user', this.filters.user);
    if (this.filters.action) params.set('action', this.filters.action);
    if (this.filters.entity) params.set('entity', this.filters.entity);

    const body = await api.get<any>(`/audits?${params.toString()}`);
    this.items = body.items || [];
    this.total = body.total || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  next() { if (this.page < this.totalPages) { this.page++; this.load(); } }
  prev() { if (this.page > 1) { this.page--; this.load(); } }
}
