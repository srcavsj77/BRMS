# BRMS Frontend - Patterns & Pilot

Exemplos de patterns solicitados: Signals, httpResource, Container/Presentational, OnPush, lazy feature structure.

Estes arquivos são exemplos e precisam ser integrados a um projeto Angular existente (Angular 16+ com Signals).

Integração rápida:

1) Copie `frontend/src/app` para o `src/app` do seu projeto Angular.

2) Adicione rota lazy no `AppRoutingModule` (exemplo já criado em `app/app-routing.module.ts`):

```ts
{ path: 'rules', loadChildren: () => import('./features/rules/rules.module').then(m => m.RulesModule) }
```

3) Executando `httpResource` tests (exemplo usa Jest): instale e rode jest/ts-jest ou adapte para Karma.

Comandos sugeridos (Jest):

```bash
npm install -D jest ts-jest @types/jest
npx ts-jest config:init
npx jest
```

Notas:

Angular Material (exemplo)

1) Instale Material e CDK:

```bash
ng add @angular/material
```

2) Importe os módulos necessários no módulo da feature (ex.: `RulesModule`):

```ts
import { MatListModule } from '@angular/material/list';
import { LayoutModule } from '@angular/cdk/layout';

@NgModule({
	imports: [MatListModule, LayoutModule]
})
export class RulesModule {}
```

3) Use o componente `RulesListMaterialComponent` (ex.: no container trocar `app-rules-list` por `app-rules-list-material`).

Rodando o GUI de demonstração

1) Garanta que o mock API do domínio esteja rodando: no diretório `BRMS/domain` execute:

```bash
npm run dev
```

2) Integre `frontend/src/app` ao seu projeto Angular (ou crie um novo app e copie a pasta `app`).

3) Instale Material/Cdk e rode a aplicação Angular:

```bash
ng add @angular/material
ng serve
```

4) Abra `http://localhost:4200` e navegue pelo menu lateral.


