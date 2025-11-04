# DataFood Analytics - Desafio God Level Coder - Nola

Esta é a solução completa para o desafio de criar uma plataforma de analytics customizável para donos de restaurantes, inspirada na persona Maria e suas dores de negócio.

O projeto consiste em uma API de backend performática (Python/FastAPI) e uma interface de frontend moderna e reativa (React/Vite) que permite a exploração de dados de forma flexível e intuitiva, sem a necessidade de conhecimento técnico.

## Stack Tecnológico

* **Backend:** Python, FastAPI, SQLAlchemy Core, PostgreSQL.
* **Frontend:** React, TypeScript, Vite, React Query, CSS Modules.
* **Ambiente de Dev:** Docker Compose (para serviços de backend) e NVM/NPM (para frontend local).

## Estrutura do Projeto (Monorepo)

O projeto é organizado como um monorepo para facilitar o desenvolvimento integrado:

```
/
├── 📂backend/       (Contém a API FastAPI, Dockerfile e scripts SQL)
├── 📂frontend/      (Contém a aplicação React/Vite)
├── 📜docker-compose.yml (Orquestra APENAS os serviços de backend)
└── 📜README.md        (Este arquivo)
```

---

## 🚀 Guia de Instalação e Execução (Modo Híbrido)

Para a melhor experiência de desenvolvimento (com *hot-reloading* instantâneo), rodaremos os serviços de backend (API + Banco) no Docker e o frontend localmente no seu terminal.

**Você precisará de dois terminais abertos.**

### Pré-requisitos

* Git
* Docker e Docker Compose
* [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager) - *Recomendado para gerenciar a versão do Node.js*

---

### Terminal 1: Backend (API + Banco de Dados)

Neste terminal, inicie os serviços que rodam no Docker.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/dutra-felipe/DataFood.git
    cd DataFood/
    ```

2.  **Inicie o Banco de Dados:**
    Este comando inicia *apenas* o container do PostgreSQL em segundo plano.
    ```bash
    docker compose up -d postgres
    ```

3.  **Gere os Dados e Crie os Índices (Apenas na 1ª vez):**
    Este é o passo mais demorado (10-15 minutos). Ele executa o script `generate_data.py` (populando ~500k de vendas) e, em seguida, executa o script `02-indices.sql` para otimizar o banco.
    ```bash
    docker compose run --rm data-generator
    ```

4.  **Inicie a API do Backend:**
    Este comando inicia a API do FastAPI. Ele também iniciará o `postgres` automaticamente (pois há um `depends_on`), mas **ignora** o `data-generator`.

    ```bash
    docker compose up api
    ```

**Deixe este terminal rodando.** Você verá os logs da API FastAPI.

---

### Terminal 2: Frontend (Aplicação React)

Neste terminal, rode a aplicação React localmente.

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd frontend/
    ```

2.  **Ative a Versão Correta do Node:**
    Usamos o NVM para garantir que você está usando a versão LTS (Estável) do Node, o que evita erros de compilação do Vite.
    ```bash
    nvm use --lts
    ```

3.  **Instale as Dependências:**
    (Se for a primeira vez ou se o `package.json` mudou).
    ```bash
    npm install
    ```

4.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```

**Deixe este terminal rodando.** Você verá a saída do Vite.

---

## ✅ Como Acessar a Aplicação

Se tudo correu bem, sua aplicação completa está no ar:

* **Aplicação Frontend:** [http://localhost:5173](http://localhost:5173)
    *(É aqui que você usará a ferramenta).*
* **Backend (API Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)
    *(Para testar os endpoints do backend).*
* **Banco de Dados:** `localhost:5432`
    *(Para conectar com o DBeaver ou similar. Credenciais: `challenge` / `challenge_2024` / `challenge_db`).*

---

## 🧠 Decisões Arquiteturais Chave

Esta seção documenta as principais decisões tomadas para atender aos critérios de avaliação (`Pensamento arquitetural`, `Performance e escala`).

1.  **API com "Query Builder" (`POST /api/query`)**
    * **Decisão:** Em vez de criar dezenas de endpoints REST (ex: `/sales/by-store`), criei um único endpoint que recebe um JSON descrevendo a análise.
    * **Justificativa:** Isso dá `flexibilidade total` (o frontend pode "inventar" novas consultas sem mudar o backend) e `performance` (o backend monta uma única query SQL otimizada, fazendo a agregação no banco de dados, não no cliente).

2.  **Fluxo de Desenvolvimento Híbrido**
    * **Decisão:** Otimizar o ambiente Docker para serviços (Banco, API) e usar o ambiente local (NPM) para a UI.
    * **Justificativa:** O desenvolvimento de UI exige recarregamento rápido (hot-reload). A camada de sincronização de volumes do Docker para `node_modules` (especialmente entre WSL e Windows) é notoriamente lenta e propensa a erros. Esta abordagem dá a estabilidade do Docker para o backend e a velocidade nativa para o frontend.

3.  **Filtros Inteligentes (com Endpoints de Opções)**
    * **Decisão:** O backend expõe rotas `GET /api/options/...` (ex: `/channels`, `/stores`) que listam as opções de filtro disponíveis.
    * **Justificativa:** Para ser `simples o suficiente para usar sem treinamento técnico`, a Maria não pode adivinhar o ID de uma loja. O frontend usa esses endpoints para popular dropdowns dinamicamente, transformando o "campo de valor" de um `input` de texto para um `<select>`, guiando o usuário e prevenindo erros.

4.  **Indexação Explícita do Banco**
    * **Decisão:** Adicionar um script (`02-indices.sql`) que cria índices em todas as Chaves Estrangeiras (`store_id`, `channel_id`, `product_id`, etc.) e colunas de filtro (`created_at`).
    * **Justificativa:** Os logs de teste mostraram que as consultas `JOIN` em 500k de registros levavam de 5 a 6 segundos. Após a indexação, esse tempo cai para menos de 1 segundo, atendendo ao critério de `queries rápidas`.

5.  **Estado Global de Data**
    * **Decisão:** O Seletor de Período (`DateRangePicker`) foi colocado no topo da página e seu estado controla *tanto* os KPIs quanto as consultas de análise.
    * **Justificativa:** Isso atende diretamente ao critério de `Ver overview do faturamento do mês` e garante que toda a página de análise seja unificada, permitindo `comparações temporais` consistentes.