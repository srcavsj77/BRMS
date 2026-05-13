# Regras de Negócio - BRMS-FGV

O BRMS-FGV centraliza a lógica de negócio para desacoplar as definições operacionais da implementação técnica dos sistemas satélites.

## 1. Definição de Regra
Uma regra no sistema é composta por:
- **Metadados**: Nome, versão, sistema associado, descrição funcional.
- **Vigência**: Data de início e fim. Regras fora do período são marcadas como "Expiradas".
- **Lógica**: Expressão lógica (atualmente em formato de texto/código) que define o comportamento.

## 2. Ciclo de Vida
1. **Rascunho**: Regra em criação, sem impacto.
2. **Ativa**: Regra vigente e disponível para consulta via API.
3. **Expirada**: Regra cujo prazo de vigência foi ultrapassado.
4. **Conflito**: Detectado pelo serviço de monitoramento quando duas regras sobrepõem critérios.

## 3. Validações Automáticas
- **Monitoramento de Vigência**: Robô em background verifica datas a cada 10 segundos.
- **Detecção de Conflitos**: Algoritmo heurístico que identifica sobreposições de IDs ou nomes de regras.

## 4. Versionamento
O sistema segue versionamento semântico (Ex: 1.2.0). 
- Mudanças funcionais leves -> Incremento de Patch (1.2.1)
- Mudanças de critérios -> Incremento de Minor (1.3.0)
- Mudanças estruturais -> Incremento de Major (2.0.0)
