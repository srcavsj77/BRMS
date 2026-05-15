import { Component, ChangeDetectionStrategy } from "@angular/core";
import { rulesStore } from "../../../core/state/rule-store";

@Component({
  selector: "app-rules-container",
  template: `
    <section>
      <h2>Regras (pilot)</h2>
      <button mat-button (click)="reload()">Recarregar</button>
      <app-rules-list-material [items]="store.list()"></app-rules-list-material>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesContainer {
  store = rulesStore;

  reload() {
    void this.store.reload();
  }
}
