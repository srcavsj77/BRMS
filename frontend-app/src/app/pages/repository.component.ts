import { Component, ChangeDetectionStrategy } from '@angular/core';
import { rulesStore } from '../core/state/rule-store';

@Component({
  selector: 'app-repository',
  template: `
    <h2>Repositório de Regras</h2>
    <p>Lista de regras armazenadas</p>
    <app-rules-list-material [items]="store.list()"></app-rules-list-material>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepositoryComponent {
  store = rulesStore;
}
