import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { RulesContainer } from "./containers/rules.container";
import { RulesListMaterialComponent } from "./components/rules-list-material.component";
import { MatListModule } from '@angular/material/list';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { RuleDetailContainer } from './containers/rule-detail.container';
import { RuleVersionsComponent } from './components/rule-versions.component';
import { RuleAuditComponent } from './components/rule-audit.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  { path: "", component: RulesContainer },
  { path: ":id", component: RuleDetailContainer }
];

@NgModule({
  declarations: [RulesContainer, RulesListMaterialComponent, RuleDetailContainer, RuleVersionsComponent, RuleAuditComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MatListModule, LayoutModule, MatButtonModule, MatCardModule, MatIconModule],
  exports: [RouterModule]
})
export class RulesModule {}
