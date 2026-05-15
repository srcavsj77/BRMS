import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { RepositoryComponent } from './pages/repository.component';
import { CreateRuleComponent } from './pages/create-rule.component';
import { MonitoringComponent } from './pages/monitoring.component';
import { AuditComponent } from './pages/audit.component';
import { ComplianceComponent } from './pages/compliance.component';
import { SettingsComponent } from './pages/settings.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'rules', loadChildren: () => import('./features/rules/rules.module').then(m => m.RulesModule) },
  { path: 'repository', component: RepositoryComponent },
  { path: 'create', component: CreateRuleComponent },
  { path: 'monitor', component: MonitoringComponent },
  { path: 'audit', component: AuditComponent },
  { path: 'compliance', component: ComplianceComponent },
  { path: 'settings', component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
