import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-monitoring',
  template: `
    <h2>Monitoramento</h2>
    <p>Visão simples de eventos/processos recentes.</p>
    <mat-card><mat-card-content>Fluxo de execuções (mock)</mat-card-content></mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringComponent {}
