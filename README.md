# MagnatasBijouxServer

Este é o servidor backend para a aplicação de e-commerce Magnatas Bijoux. Ele é responsável por gerenciar a autenticação de usuários, produtos, e o carrinho de compras. Construído com Node.js e Express, utiliza MongoDB como banco de dados.

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

## Instalação e Execução

Siga as instruções abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (instância local ou um cluster no MongoDB Atlas)

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Tane-se/MagnatasBijouxServer.git
   cd MagnatasBijouxServer
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo chamado `.env` na raiz do projeto e adicione as seguintes variáveis:
   ```env
   # String de conexão do MongoDB
   MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

   # Segredo para gerar os tokens JWT
   JWT_SECRET=seu_segredo_super_secreto

   # (Opcional) Tempo de expiração do token (padrão: "7d")
   JWT_EXPIRES_IN=7d

   # (Opcional) Salt rounds para o bcrypt (padrão: 10)
   BCRYPT_SALT_ROUNDS=10
   ```
   **Nota:** Certifique-se de substituir os valores de exemplo (`<...>` e `seu_segredo_super_secreto`) pelos seus próprios.

4. **Execute o servidor:**
   ```bash
   npm start
   ```
   O servidor estará rodando em `http://localhost:3001` (ou na porta definida pela sua configuração de ambiente).
