# HOUSE — Onde vamos morar?

Comparador residencial da Nomos Ludens para Pindamonhangaba/SP. O MVP usa HTML, CSS e JavaScript nativos, serve o mapa com Leaflet e usa tiles do OpenStreetMap. A publicação JSON é estática; não há banco de dados, serviço pago, credencial ou autenticação própria.

## Desenvolvimento local

Requisitos: Node.js 22+ e npm.

```sh
npm ci
npm run check
npm run dev
```

Wrangler serve `dist/` na porta local 8787. `npm run check` roda testes de lógica e gera o build, validando o JSON. Para os testes no Chromium instalado em `/usr/bin/chromium`:

```sh
npm run test:browser
```

Se o Chromium estiver em outro caminho, configure `HOUSE_CHROMIUM`. Os testes de navegador cobrem viewports desktop e mobile e usam anúncios sintéticos somente em respostas interceptadas pelo teste.

## Dados

`public/data/estudo.json` é o arquivo publicado pelo repositório. O contrato completo, incluindo os campos obrigatórios, elegibilidade e ordenação, está em [docs/contrato-json.md](docs/contrato-json.md). A validação executável fica em `public/model.js` e roda tanto no build quanto no navegador.

A fonte de verdade é a planilha compartilhada. A integração para ler a planilha ou publicar alterações automaticamente ainda não faz parte deste MVP. O arquivo inicial está vazio (`listings: []`, `observations: []`): não há anúncios reais publicados porque a planilha não pôde ser consultada neste ambiente. Valores desconhecidos devem continuar `null`; o aplicativo não os estima.

Filtros: 2 ou 3 quartos e todos os bairros presentes na publicação. Pasin, Mombaça e Castolira recebem destaque. O ranking inclui somente anúncios ativos, verificados individualmente nos últimos sete dias. Os cinco cenários leem combustível mensal já calculado e referenciado pela planilha; não há estimativa de rota no navegador. Imóveis sem coordenadas podem ser comparados pelo custo, mas não aparecem no mapa.

## Estrutura

- `public/index.html`, `style.css`, `app.js`: interface e comportamento responsivo.
- `public/model.js`: validação, filtros, elegibilidade e ranking.
- `public/data/estudo.json`: publicação de dados.
- `public/_headers`: cabeçalhos de segurança para Static Assets.
- `scripts/build.mjs`: valida a publicação e monta `dist/`, incluindo Leaflet local.
- `tests/`: testes do modelo e do fluxo de navegador.
- `wrangler.jsonc`: configuração Cloudflare Workers Static Assets.

## Cloudflare Workers Builds — conexão futura

A configuração está pronta para Workers Static Assets e o plano Free, conforme os limites atuais do Cloudflare. Nenhum deploy foi feito nesta missão.

Depois de revisar e integrar esta branch em `master`, conecte `NomosLudens/house` pelo painel Cloudflare Workers Builds. Configure a raiz do projeto, Node.js 22+, branch `master`, comando de build `npm ci && npm run check` e comando de deploy `npx wrangler deploy`. O Wrangler lê `wrangler.jsonc` e publica `dist/`. A autorização é concedida pelo fluxo GitHub do Cloudflare; não há token Cloudflare neste repositório. Não habilite deploy de produção ou previews de branches sem a autorização correspondente.

Para validar a configuração sem publicar, use `npx wrangler deploy --dry-run`.
