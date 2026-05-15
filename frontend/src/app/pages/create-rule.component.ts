import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

const API_BASE = 'http://localhost:3334';

@Component({
  selector: 'app-create-rule',
  template: `
    <h2>Criação de Regras</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field appearance="fill" style="width:100%">
        <mat-label>Nome</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>

      <mat-form-field appearance="fill" style="width:100%">
        <mat-label>Descrição</mat-label>
        <input matInput formControlName="description" />
      </mat-form-field>

      <mat-form-field appearance="fill" style="width:100%">
        <mat-label>Expressão</mat-label>
        <input matInput formControlName="expression" />
      </mat-form-field>

      <div style="display:flex; gap:12px; margin-top:12px">
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Criar</button>
        <button mat-button type="button" (click)="form.reset()">Limpar</button>
      </div>
    </form>

    <p *ngIf="result" style="margin-top:12px">{{ result }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRuleComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    expression: ['', Validators.required],
    category: [''],
    owner: ['']
  });

  result: string | null = null;

  constructor(private fb: FormBuilder) {}

  async submit() {
    if (this.form.invalid) return;
    const payload = {
      ...this.form.value,
      applications: [],
      documents: []
    };

    try {
      const res = await fetch(`${API_BASE}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Erro ao criar regra');
      const body = await res.json();
      this.result = `Regra criada: ${body.id}`;
      this.form.reset();
    } catch (e: any) {
      this.result = `Erro: ${e.message}`;
    }
  }
}
