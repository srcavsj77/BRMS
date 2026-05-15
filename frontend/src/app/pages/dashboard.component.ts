import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="grid">
      <mat-card class="card">
        <mat-card-title>Visão Geral</mat-card-title>
        <mat-card-content>
          <p>Resumo de regras ativas, em validação e obsoletas.</p>
        </mat-card-content>
      </mat-card>

      <mat-card class="card">
        <mat-card-title>Monitoramento</mat-card-title>
        <mat-card-content>
          <p>Métricas em tempo real (ex.: execuções, rejeições).</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: ['.grid { display: flex; gap: 16px; flex-wrap: wrap } .card { flex: 1 1 300px }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
