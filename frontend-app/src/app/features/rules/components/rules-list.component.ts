import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import type { Rule } from "../models";

@Component({
  selector: "app-rules-list",
  template: `
    <div *ngIf="items?.length; else empty">
      <ul>
        <li *ngFor="let r of items">{{ r.name }} <small>{{ r.status }}</small></li>
      </ul>
    </div>
    <ng-template #empty>
      <p>Nenhuma regra</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesListComponent {
  @Input() items: Rule[] | undefined;
}
