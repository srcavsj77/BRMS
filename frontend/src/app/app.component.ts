import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <h3 class="logo">BRMS</h3>
        <mat-nav-list>
          <a mat-list-item routerLink="/" routerLinkActive="active">Painel BRMS</a>
          <a mat-list-item routerLink="/repository" routerLinkActive="active">Repositório de Regras</a>
          <a mat-list-item routerLink="/create" routerLinkActive="active">Criação de Regras</a>
          <a mat-list-item routerLink="/monitor" routerLinkActive="active">Monitoramento</a>
          <a mat-list-item routerLink="/audit" routerLinkActive="active">Auditoria</a>
          <a mat-list-item routerLink="/compliance" routerLinkActive="active">Conformidade</a>
          <a mat-list-item routerLink="/settings" routerLinkActive="active">Configurações</a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>BRMS - Painel</span>
        </mat-toolbar>

        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `.sidenav-container { height: 100vh; }`,
    `.sidenav { width: 220px; padding: 16px; background: #f7f9fc }`,
    `.logo { margin: 0 0 12px 8px }`,
    `.content { padding: 24px; background: #f1f5f9; min-height: calc(100vh - 64px) }`,
    `.active { font-weight: 600 }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
