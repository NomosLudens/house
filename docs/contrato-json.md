# Contrato JSON da planilha — versão 1

O arquivo público é `public/data/estudo.json`, em UTF-8. A raiz contém `version` (inteiro `1`), `updatedAt` (timestamp ISO 8601 ou `null` antes da publicação), `listings` (array) e `observations` (array de objetos `{ "text": "..." }`). Uma publicação vazia válida é:

```json
{"version":1,"updatedAt":null,"listings":[],"observations":[]}
```

O validador em `public/model.js` rejeita versões desconhecidas, anúncio malformado, IDs duplicados, datas inválidas, preços negativos, links que não sejam HTTP(S), coordenadas fora de faixa e cenários incompletos. Ele roda no build e no carregamento do site. Se a publicação inteira for inválida, o ranking não é exibido.

## Anúncio individual (`listings[]`)

Todos os campos listados são obrigatórios:

| Campo | Tipo e regra |
| --- | --- |
| `id` | string não vazia e única |
| `title` | descrição do anúncio |
| `city` | exatamente `Pindamonhangaba` |
| `neighborhood` | bairro como publicado na planilha; sem enumeração fechada |
| `bedrooms` | `2` ou `3` |
| `status` | `active`, `inactive` ou `unverified` |
| `verified` | booleano; verdadeiro apenas depois da checagem individual |
| `verifiedAt` | timestamp ISO 8601 quando verificado; caso contrário `null` é aceito |
| `url` | URL HTTP(S) individual do anúncio |
| `costs` | objeto com `rent`, `condo`, `iptu`: valores mensais numéricos não negativos ou `null` |
| `scenarios` | exatamente cinco itens ordenados pela lista abaixo, cada um com `fuel` (valor mensal não negativo ou `null`) e `source` (fonte textual do cálculo) |
| `coordinates` | `[latitude, longitude]` ou `null` |

O IPTU deve ser convertido para valor mensal conferido pela planilha. `null` significa desconhecido; use zero somente quando confirmado. A fonte do combustível deve identificar aba/célula ou intervalo da planilha suficiente para auditoria. Se o cálculo não puder ser confirmado, use `fuel: null` e explique a ausência da fonte.

## Cenários, na ordem do array

1. Um único carro, Antônio dirigindo desde a manhã.
2. Um único carro, Juliane dirigindo desde a manhã.
3. Carros separados.
4. Carona com posterior recuperação do carro de Antônio.
5. Carona com posterior recuperação do carro de Juliane.

Premissas de referência: 22 dias de trabalho/mês; 20 noites de faculdade/mês; Antônio usa etanol a R$ 4/L e faz 10 km/L; Juliane usa gasolina a R$ 6/L e faz 8 km/L. Destinos: CMEI Monsenhor Jonas Abib (Residencial Arco-Íris), CMEI Sá Maria (Residencial Pasin) e Anhanguera Pindamonhangaba.

O aplicativo consome os custos de combustível calculados pela planilha. Não calcula distâncias, itinerários, viagens ou rotas, e não oferece simulação editável. A planilha precisa considerar sequência dos destinos, motorista, veículo, frequência e recuperação do carro. Não invente distâncias nem trate um nome de cenário como rota suficientemente definida.

## Ranking e dados fora do ranking

Somente anúncios `active`, com `verified: true` e verificados há no máximo sete dias entram no ranking de imóveis disponíveis e no mapa. Anúncios antigos, inativos ou não verificados ficam em “Fora do ranking”; observações nunca são anunciadas como imóveis disponíveis.

O custo total conhecido soma aluguel, condomínio, IPTU mensal e combustível do cenário selecionado. Totais com todos os campos conhecidos vêm primeiro em ordem crescente. Custos desconhecidos permanecem desconhecidos; subtotais são identificados como parciais e não apresentados como custo total. A data de publicação antiga é sinalizada.

A validação estrutural não verifica a verdade do anúncio nem acessa a planilha. Quem publica deve conferir anúncio, disponibilidade, valores, data e fonte dos cálculos antes de alterar o JSON.
