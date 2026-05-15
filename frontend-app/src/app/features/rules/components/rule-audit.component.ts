import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-rule-audit',
  template: `
    <div *ngIf="audits?.length; else empty">
      <mat-list>
        <mat-list-item *ngFor="let a of audits">
          <div>{{ a.user }} • {{ a.action }} • {{ a.timestamp }}</div>
          <div class="details">{{ a.details }}</div>
        </mat-list-item>
      </mat-list>
    </div>
    <ng-template #empty><p>Nenhum log de auditoria</p></ng-template>
  `,
  styles: ['.details { color: rgba(0,0,0,0.6); font-size: 0.9em }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleAuditComponent {
  @Input() audits: any[] | undefined;
}
