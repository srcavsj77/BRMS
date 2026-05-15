import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rule-versions',
  template: `
    <div *ngIf="versions?.length; else empty">
      <mat-list>
        <mat-list-item *ngFor="let v of versions">
          <div style="flex:1">
            <strong>v{{ v.version }}</strong> — {{ v.justification }} <small>({{ v.createdAt }})</small>
          </div>
          <button mat-button color="warn" (click)="onRollback(v)">Reverter</button>
        </mat-list-item>
      </mat-list>
    </div>
    <ng-template #empty><p>Nenhuma versão encontrada</p></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleVersionsComponent {
  @Input() versions: any[] | undefined;
  @Output() rollback = new EventEmitter<number>();

  onRollback(v: any) {
    this.rollback.emit(v.version);
  }
}
