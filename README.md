# FinTrack Web

Frontend de uma aplicação de gestão financeira pessoal, desenvolvido com **React e TypeScript**. A interface consome a [FinTrack API](https://github.com/Padokazzz/FinTrack), permitindo que usuários organizem contas, categorias e transações e acompanhem um resumo financeiro mensal.

O objetivo do projeto é construir uma experiência de uso completa em torno de uma API própria, com componentes reutilizáveis, formulários validados, gerenciamento de estado remoto e tratamento consistente dos estados da interface.

![Prévia do dashboard FinTrack](docs/images/dashboard-preview.png)

## Funcionalidades

- Cadastro e login com autenticação JWT.
- Dashboard com resumo financeiro mensal.
- Gerenciamento de contas e categorias.
- Criação, edição, consulta e remoção de transações.
- Criação, consulta e reversão de transferências entre contas.
- Filtros por mês, ano, tipo e categoria.
- Históricos de transações e transferências paginados pela API.
- Formulários com validação.
- Estados de carregamento, erro e ausência de dados.
- Área autenticada com navegação lateral.

## Stack

| Responsabilidade | Tecnologias |
| --- | --- |
| Interface | React · TypeScript · Vite |
| Rotas | React Router |
| Estado remoto | TanStack Query |
| Formulários | React Hook Form · Zod |
| HTTP | Axios |
| Estilização | Tailwind CSS |
| Visualização de dados | Recharts |
| Ícones | Lucide React |
| Qualidade | ESLint |

## Organização do código

A estrutura é organizada por funcionalidades. Cada domínio mantém próximo o que pertence a ele, enquanto componentes e utilitários compartilhados ficam em diretórios próprios.

```text
src/
├── app/
│   ├── providers.tsx
│   └── routes.tsx
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   ├── accounts/
│   ├── auth/
│   ├── categories/
│   ├── summaries/
│   ├── transactions/
│   └── transfers/
└── lib/
    ├── api.ts
    ├── api-error.ts
    ├── auth-storage.ts
    └── formatters.ts
```

### Decisões de implementação

- **Organização por domínio:** telas, serviços, tipos, schemas e componentes relacionados ficam agrupados por funcionalidade.
- **TanStack Query:** gerencia cache, carregamento, erros e atualização dos dados remotos.
- **React Hook Form + Zod:** combina gerenciamento de formulários e validação de dados.
- **Axios:** centraliza a comunicação HTTP com a API.
- **Componentes compartilhados:** elementos de interface e layout são reutilizados sem acoplar as funcionalidades entre si.

## Integração com o backend

Este frontend depende da [FinTrack API](https://github.com/Padokazzz/FinTrack).

A URL base padrão esperada é:

```text
http://localhost:8080/api
```

Se a API estiver em outro endereço, configure `VITE_API_BASE_URL` no ambiente do frontend.

## Executar localmente

### Pré-requisitos

- Node.js e npm.
- Git.
- FinTrack API em execução.

Clone o repositório:

```bash
git clone https://github.com/Padokazzz/fintrack-web.git
cd fintrack-web
```

Instale as dependências e configure o ambiente:

```bash
npm install
cp .env.example .env
```

No arquivo `.env`, informe a URL da API:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

Em outro terminal, inicie a API seguindo as instruções do [README do backend](https://github.com/Padokazzz/FinTrack).

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera a build de produção. |
| `npm run lint` | Executa o ESLint. |
| `npm run preview` | Pré-visualiza a build localmente. |

O GitHub Actions roda a instalação pelo lockfile, o lint e o build em pull requests para a `main`. Para repetir as verificações localmente:

```bash
npm ci
npm run lint
npm run build
```

## Fluxo principal

1. O usuário cria uma conta ou realiza login.
2. A aplicação utiliza o token JWT nas chamadas autenticadas.
3. O usuário cadastra contas financeiras e categorias.
4. As transações são registradas e associadas aos recursos correspondentes.
5. O dashboard consulta os dados e apresenta o resumo do período.

## Tratamento de estados e validações

Os formulários utilizam Zod integrado ao React Hook Form para validar os dados antes do envio. A interface também contempla estados de carregamento, listas vazias e falhas nas operações.

Quando a API retorna `401 Unauthorized`, a sessão local é invalidada e o usuário é direcionado ao fluxo de autenticação.

## Próximas melhorias

- [ ] Adicionar testes de componentes.
- [ ] Criar testes de integração para fluxos com a API.
- [x] Aplicar carregamento sob demanda nas rotas.
- [ ] Evoluir a experiência em dispositivos móveis.
- [ ] Ampliar os gráficos e filtros do dashboard.
- [ ] Preparar imagem Docker para o frontend.

## Projeto relacionado

- [FinTrack API](https://github.com/Padokazzz/FinTrack): backend em ASP.NET Core e PostgreSQL.

---

Desenvolvido por [Leonardo Padilha](https://www.leonardopadilha.com).
