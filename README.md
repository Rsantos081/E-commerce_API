# 🛒 E-commerce API

API REST desenvolvida em Python utilizando Flask para simular funcionalidades básicas de um sistema de e-commerce.

O projeto implementa autenticação de usuários, gerenciamento de produtos e operações de carrinho de compras, aplicando conceitos fundamentais de desenvolvimento Backend, bancos de dados relacionais e APIs REST.

## 🚀 Tecnologias Utilizadas

* Python
* Flask
* Flask-SQLAlchemy
* Flask-Login
* SQLite
* Swagger (Flasgger)
* SQLAlchemy
* Postman
* Dotenv

## 📋 Funcionalidades

### Autenticação

* Login de usuários
* Logout de usuários
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
* Finalizar compra
* Limpar carrinho após checkout

## 🗂 Estrutura do Projeto

```text
E-commerce_API/
│
├── app.py
├── swagger.yaml
├── requirements.txt
├── .env
├── instance/
│   └── ecommerce.db
└── README.md
```

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

Crie um arquivo `.env`:

```env
SECRET_KEY=sua_chave_secreta
```

Execute a aplicação:

```bash
python app.py
```

## 📚 Documentação Swagger

Após iniciar a aplicação, a documentação estará disponível em:

```text
http://127.0.0.1:5000/apidocs
```

## 🧪 Testes

As rotas podem ser testadas utilizando:

* Postman
* Swagger UI

## Exemplo de Produto

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
* Documentação de APIs
* Boas práticas de organização Backend

## 🎯 Objetivo

Este projeto foi desenvolvido com fins de aprendizado para praticar conceitos de desenvolvimento Backend utilizando Python e Flask, simulando operações essenciais de um sistema de e-commerce.

## 👨‍💻 Autor

Ruan Thomaz de Freitas Santos

GitHub: https://github.com/Rsantos081

LinkedIn: https://www.linkedin.com/in/ruan-thomaz7889/
