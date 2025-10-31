# DataFood Analytics API - Desafio God Level

Esta é a implementação do backend para o desafio God Level Coder, que consiste em uma API de analytics customizável para donos de restaurantes. O objetivo é fornecer uma ferramenta poderosa para que usuários não-técnicos possam explorar seus dados operacionais de forma flexível e performática.

## Stack Tecnológico

* **Linguagem:** Python 3.11
* **Framework:** FastAPI
* **Banco de Dados:** PostgreSQL
* **ORM / Acesso a Dados:** SQLAlchemy Core
* **Validação de Dados:** Pydantic
* **Ambiente:** Docker & Docker Compose

## Arquitetura

A principal decisão arquitetural foi a criação de um único e poderoso endpoint, `POST /api/query`, em vez de múltiplos endpoints REST tradicionais (`/sales`, `/products`, etc.).

Esta abordagem foi escolhida por três motivos:
1.  **Performance:** Toda a lógica de agregação, junção e filtragem de dados ocorre no servidor e no banco de dados, que são otimizados para essa tarefa. Apenas o resultado final e consolidado é enviado para o cliente.
2.  **Flexibilidade:** Permite que o frontend construa uma infinidade de consultas analíticas combinando métricas, dimensões e filtros, sem a necessidade de modificar o backend.
3.  **Manutenibilidade:** A lógica de negócio fica centralizada em um `QueryBuilder`, facilitando a otimização de consultas e a adição de novas métricas ou dimensões no futuro.

## Como Executar a Aplicação

Siga os passos abaixo para construir e executar todo o ambiente (API, Banco de Dados e Gerador de Dados) localmente.

### Pré-requisitos
* Git
* Docker e Docker Compose

### Passo a Passo

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/dutra-felipe/DataFood.git
    cd DataFood
    ```

2.  **Setup Inicial (Primeira Execução)**
    Estes comandos irão construir a imagem Docker, criar e popular o banco de dados.

    **Construa a Imagem e Inicie o Banco de Dados:**

    ```bash
    docker compose up -d --build postgres
    ```
    * `--build`: Constrói a imagem da sua aplicação a partir do `Dockerfile`.
    * `-d`: Roda o banco de dados em segundo plano (detached).

    **Popule o Banco de Dados:**

    Este é o passo demorado (5-15 minutos). Ele executa o script que gera 500.000 registros de vendas.

    ```bash
    docker compose run --rm data-generator
    ```

    **Verifique se os Dados Foram Criados (Opcional):**

    ```bash
    docker compose exec postgres psql -U challenge challenge_db -c "SELECT COUNT(*) FROM sales;"
    ```
    *Você deverá ver uma contagem de ~500.000.*

---
## Como Testar a API

A forma mais fácil de testar a API é através da documentação interativa gerada automaticamente pelo FastAPI.

1.  **Acesse a Documentação:**
    Com a aplicação rodando, abra seu navegador e acesse: [http://localhost:8000/docs](http://localhost:8000/docs)

2.  **Execute uma Consulta de Exemplo:**
    * Clique na seção do endpoint `POST /api/query` para expandi-la.
    * Clique no botão **"Try it out"**.
    * No campo "Request body", cole o JSON abaixo. Esta consulta responde à pergunta: "Quais são os 5 produtos mais vendidos (em quantidade de pedidos) nas quintas-feiras à noite no iFood?"
        ```json
        {
          "metrics": [
            {
              "field": "sale_id",
              "function": "count",
              "alias": "quantidade_pedidos"
            }
          ],
          "dimensions": [
            "product_name"
          ],
          "filters": [
            {
              "field": "channel_name",
              "operator": "equals",
              "value": "iFood"
            },
            {
              "field": "day_of_week",
              "operator": "equals",
              "value": 4
            },
            {
              "field": "hour_of_day",
              "operator": "greater_than",
              "value": 18
            }
          ],
          "order_by": {
            "field": "quantidade_pedidos",
            "direction": "desc"
          },
          "limit": 5
        }
        ```
    * Clique no botão azul **"Execute"**.

    Você deverá receber uma resposta com código `200` e os dados dos 5 produtos mais vendidos que correspondem aos critérios.

## Estrutura do Projeto

```
┣ 📂app                        # Contém todo o código-fonte da aplicação FastAPI.
┃ ┣ 📂core                     # Configurações globais (variáveis de ambiente).
┃ ┃ ┗ 📜config.py
┃ ┣ 📂services                 # Lógica de negócio (o QueryBuilder).
┃ ┃ ┗ 📜query_builder.py
┃ ┣ 📜__init__.py
┃ ┣ 📜database.py              # Configuração da conexão com o banco.
┃ ┣ 📜main.py                  # Definição dos endpoints da API.
┃ ┗ 📜schemas.py               # Modelos Pydantic para validação de dados.
┣ 📜.env                       # Arquivo para variáveis de ambiente (ignorado pelo Git).
┣ 📜.gitignore
┣ 📜database-schema.sql        # Script para criação das tabelas
┣ 📜docker-compose.yml         # Orquestra a execução da API e do banco de dados.
┣ 📜Dockerfile                 # Receita para construir a imagem Docker da aplicação.
┣ 📜generate_data.py           # Gerador dos dados para povoamento do banco de dados
┣ 📜README.md
┗ 📜requirements.txt
```