import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import type { Rule } from '../models';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-rules-list-material',
  template: `
    <div [class.cols-1]="cols === 1" [class.cols-2]="cols === 2">
      <mat-list role="list">
        <mat-list-item *ngFor="let r of items" [routerLink]="['/rules', r.id]"> 
          <div mat-line>{{ r.name }}</div>
          <div mat-line class="secondary">{{ r.status }}</div>
          <mat-icon matSuffix>chevron_right</mat-icon>
        </mat-list-item>
      </mat-list>
    </div>
  `,
  styles: [
    `.cols-2 mat-list-item { display: inline-block; width: 48%; margin: 1%; }`,
    `.cols-1 mat-list-item { display: block; width: 100%; }`,
    `.secondary { color: rgba(0,0,0,0.6); font-size: 0.9em; }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesListMaterialComponent {
  @Input() items: Rule[] | undefined;

  cols = 1;

  constructor(private bp: BreakpointObserver) {
    this.bp.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe((s) => {
      this.cols = s.matches ? 1 : 2;
    });
  }
}
