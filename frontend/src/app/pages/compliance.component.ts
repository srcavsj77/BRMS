import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-compliance',
  template: `
    <h2>Conformidade</h2>
    <p>Checks e regras relacionadas a compliance.</p>
    <mat-card><mat-card-content>Exemplo: Regras com impacto regulatório.</mat-card-content></mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceComponent {}
