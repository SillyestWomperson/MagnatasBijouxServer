# MagnatasBijouxServer

## Contribuições por Rota

Este projeto foi desenvolvido por **Tanese**, **Gabriel** e **Miguel** nas rotas.

Abaixo, um detalhamento das responsabilidades:

### Rotas de Autenticação (`/api/auth`)
Todas as rotas de autenticação (login, registro, logout, exclusão de conta, e alteração de senha) foram desenvolvidas pelo **Tanese**:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `DELETE /api/auth/delete`
- `PATCH /api/auth/change-password`

### Rotas de Usuário (`/api/users`)
Todas as rotas de gerenciamento de usuário foram desenvolvidas pelo **Tanese**:
- `GET /api/users/me`
- `PUT /api/users/update`

### Rotas de Produtos (`/api/products`)
Todas as rotas de produtos (listar, buscar por ID, e adicionar novo produto) foram desenvolvidas pelo **Tanese**:
- `GET /api/products`
- `GET /api/products/:productId`
- `POST /api/products`

### Rotas de Carrinho (`/api/cart`)

As rotas do carrinho foram divididas entre o **Gabriel** e o **Miguel**:

- **Gabriel** desenvolveu:
  - `DELETE /api/cart` (Limpa todos os itens do carrinho)
  - `DELETE /api/cart/:productId` (Remove um item específico do carrinho)
  - `PATCH /api/cart` (Atualiza a quantidade, tamanho ou tipo de banho de um item no carrinho)

- **Miguel** desenvolveu:
  - `POST /api/cart` (Adiciona um item ao carrinho ou incrementa sua quantidade se já existir)
  - `GET /api/cart` (Recupera todos os itens do carrinho de um usuário)
