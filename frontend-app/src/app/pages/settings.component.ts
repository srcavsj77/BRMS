import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `
    <h2>Configurações</h2>
    <p>Ajustes de governança, integrações e usuários.</p>
    <mat-card><mat-card-content>Configurações do sistema (mock)</mat-card-content></mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {}
