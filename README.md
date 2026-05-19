# Simulador INSS

Implementacao estatica de uma simulacao de margem consignavel INSS com:

- base do beneficio (salario);
- RMC e RCC de 5% cada (aplicados automaticamente);
- margem nova de 40%;
- calculo: **Margem disponivel = Margem total nova (40%) - Margem comprometida com emprestimo**;
- indicador visual: verde se margem disponivel > 0, vermelho se < 0;
- salvamento local no navegador;
- exportacao por impressao/PDF do navegador.

## Como usar

Abra `index.html` no navegador. Preencha a base de calculo do beneficio e a margem comprometida com emprestimo. O resultado da margem disponivel aparecera em verde (sucesso) ou vermelho (margem insuficiente).

Nao ha etapa de build nem dependencias locais.


