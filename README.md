# 🛒 E-commerce API

API REST desenvolvida em Python utilizando Flask para simular funcionalidades básicas de um sistema de e-commerce.

O projeto implementa autenticação de usuários, gerenciamento de produtos e operações de carrinho de compras, aplicando conceitos fundamentais de desenvolvimento Backend, bancos de dados relacionais e APIs REST.

## 🚀 Tecnologias Utilizadas

* Python
* Flask
* Flask-SQLAlchemy
* Flask-Login
* SQLite
* SQLAlchemy
* Postman
* Dotenv

## 📋 Funcionalidades

### Autenticação

* Login de usuários
* Logout de usuários
* Cadastro de novos usuários
* Controle de acesso utilizando Flask-Login
* Proteção de rotas através de `@login_required`

### Produtos

* Adicionar produtos
* Listar produtos
* Buscar produto por ID
* Atualizar produto
* Excluir produto

### Carrinho de Compras

* Adicionar item ao carrinho
* Remover item do carrinho
* Visualizar carrinho
* Finalizar compra (checkout)
* Limpar carrinho após checkout

## 🗂 Estrutura do Projeto

```text
e-commerce_API-main/
│
├── run.py                   # Ponto de entrada da aplicação
├── swagger.yaml              # Especificação da API (referência estática)
├── requirements.txt
├── .env                      # Não versionado (você precisa criar)
├── instance/
│   └── ecommerce.db
├── app/
│   ├── __init__.py           # create_app(): configuração e registro dos blueprints
│   ├── extensions.py         # Instâncias do SQLAlchemy e do LoginManager
│   ├── models.py             # Usuario, Produto, ItemCarrinho
│   ├── auth/
│   │   ├── __init__.py       # Blueprint 'auth' (prefixo /api)
│   │   └── routes.py         # login, logout, register
│   └── src/
│       ├── __init__.py       # Blueprints 'products' (/api/products) e 'cart' (/cart)
│       └── routes.py         # Rotas de produtos e carrinho
└── README.md
```

## 🔌 Endpoints Disponíveis

### Autenticação (`/api`)

| Método | Rota            | Descrição                    | Autenticação |
|--------|-----------------|-------------------------------|--------------|
| POST   | `/api/login`    | Login do usuário              | -            |
| POST   | `/api/logout`   | Logout do usuário             | -            |
| POST   | `/api/register` | Cadastro de novo usuário      | -            |

### Produtos (`/api/products`)

| Método | Rota                            | Descrição                     | Autenticação      |
|--------|----------------------------------|--------------------------------|--------------------|
| GET    | `/api/products/`                | Lista todos os produtos        | -                  |
| GET    | `/api/products/<product_id>`    | Busca produto por ID           | -                  |
| POST   | `/api/products/add`             | Adiciona um novo produto       | `@login_required`  |
| PUT    | `/api/products/update/<product_id>` | Atualiza um produto        | `@login_required`  |
| DELETE | `/api/products/delete/<product_id>` | Remove um produto          | `@login_required`  |

### Carrinho de Compras (`/cart`)

| Método | Rota                        | Descrição                          | Autenticação      |
|--------|------------------------------|-------------------------------------|--------------------|
| GET    | `/cart/`                    | Visualiza o carrinho do usuário     | `@login_required`  |
| POST   | `/cart/add/<product_id>`    | Adiciona item ao carrinho           | `@login_required`  |
| DELETE | `/cart/remove/<product_id>` | Remove item do carrinho             | `@login_required`  |
| POST   | `/cart/checkout`            | Finaliza a compra e esvazia o carrinho | `@login_required` |

> ⚠️ As rotas protegidas com `@login_required` exigem que o usuário esteja autenticado via `/api/login` (o Flask-Login mantém a sessão via cookie).

## ⚙️ Instalação

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/E-commerce_API.git
```

Acesse a pasta do projeto:

```bash
cd E-commerce_API
```

Crie um ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual:

Windows:

```bash
.venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie um arquivo `.env` na raiz do projeto:

```env
SECRET_KEY=sua_chave_secreta
```

Execute a aplicação:

```bash
python run.py
```

Por padrão, a API sobe em `http://127.0.0.1:5000`.

## 📚 Documentação da API

A especificação da API está descrita no arquivo [`swagger.yaml`](./swagger.yaml), no formato Swagger 2.0.

> ℹ️ Atualmente esse arquivo é uma referência estática (as rotas e schemas são documentados manualmente). Para visualizá-lo interativamente, você pode colar o conteúdo em um editor online como o [Swagger Editor](https://editor.swagger.io/), ou importar no Postman.

## 🧪 Testes

As rotas podem ser testadas utilizando:

* Postman
* Swagger Editor (a partir do `swagger.yaml`)

## Exemplo de Requisições

**Registro de usuário** — `POST /api/register`
```json
{
    "nome": "usuario_teste",
    "senha": "senha123"
}
```

**Login** — `POST /api/login`
```json
{
    "nome": "usuario_teste",
    "senha": "senha123"
}
```

**Adicionar produto** — `POST /api/products/add`
```json
{
    "nome": "Notebook Gamer",
    "preco": 4500.00,
    "descricao": "Notebook para jogos e desenvolvimento"
}
```

## 📖 Conceitos Aplicados

* APIs REST
* CRUD
* Relacionamentos com SQLAlchemy
* Autenticação e autorização
* Sessões de usuário
* Persistência de dados
* Organização com Blueprints e Application Factory (`create_app()`)
* Boas práticas de organização Backend

## 🎯 Objetivo

Este projeto foi desenvolvido com fins de aprendizado para praticar conceitos de desenvolvimento Backend utilizando Python e Flask, simulando operações essenciais de um sistema de e-commerce.
