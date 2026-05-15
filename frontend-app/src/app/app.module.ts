import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RulesModule } from './features/rules/rules.module';
import { DashboardComponent } from './pages/dashboard.component';
import { RepositoryComponent } from './pages/repository.component';
import { CreateRuleComponent } from './pages/create-rule.component';
import { MonitoringComponent } from './pages/monitoring.component';
import { AuditComponent } from './pages/audit.component';
import { ComplianceComponent } from './pages/compliance.component';
import { SettingsComponent } from './pages/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    RepositoryComponent,
    CreateRuleComponent,
    MonitoringComponent,
    AuditComponent,
    ComplianceComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    RulesModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
