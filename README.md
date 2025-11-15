# 🏫 Sistema de Gerenciamento de Salas e Laboratórios

Sistema completo para gerenciamento de reservas de salas e laboratórios com autenticação, controle de permissões e aprovação de reservas.

## 📋 Funcionalidades

### Administrador
- Cadastrar novos professores
- Visualizar todas as reservas pendentes
- Aprovar ou rejeitar reservas
- Gerenciar salas e laboratórios

### Professor
- Visualizar salas disponíveis
- Solicitar reservas de salas
- Visualizar suas próprias reservas
- Cancelar reservas pendentes
- Ver horários ocupados de cada sala

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: Supabase PostgreSQL
- **Frontend**: HTML, CSS, JavaScript puro
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: bcrypt

## 📦 Instalação

### 1. Configurar o Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Acesse o SQL Editor e execute o script SQL fornecido acima para criar as tabelas
4. Copie a URL do projeto e a chave API (anon key)

### 2. Configurar o Backend

```bash
# Navegar para a pasta backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas credenciais do Supabase
# SUPABASE_URL=sua_url_aqui
# SUPABASE_KEY=sua_chave_aqui
# JWT_SECRET=seu_segredo_jwt_aqui
```

### 3. Iniciar o Backend

```bash
# Modo desenvolvimento (com nodemon)
npm run dev

# Ou modo produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

### 4. Configurar o Frontend

```bash
# Navegar para a pasta frontend
cd frontend

# Abrir com Live Server ou servir com qualquer servidor HTTP
# Exemplo com Python:
python -m http.server 8000

# Ou com Node.js:
npx http-server -p 8000
```

Acesse `http://localhost:8000` no navegador

## 🔑 Credenciais Padrão

**Administrador:**
- Email: `admin@sistema.com`
- Senha: `admin123`

## 📁 Estrutura do Projeto

```
projeto/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js          # Configuração Supabase
│   │   ├── middleware/
│   │   │   └── auth.js              # Middleware de autenticação
│   │   ├── routes/
│   │   │   ├── auth.js              # Rotas de autenticação
│   │   │   ├── users.js             # Rotas de usuários
│   │   │   ├── rooms.js             # Rotas de salas
│   │   │   └── reservations.js      # Rotas de reservas
│   │   └── server.js                # Servidor principal
│   ├── package.json
│   └── .env
└── frontend/
    ├── index.html                    # Página de login
    ├── cadastro.html                 # Página de cadastro (admin)
    ├── dashboard.html                # Dashboard principal
    ├── css/
    │   └── style.css                 # Estilos globais
    └── js/
        ├── auth.js                   # Lógica de autenticação
        ├── cadastro.js               # Lógica de cadastro
        └── dashboard.js              # Lógica do dashboard
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: users
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, hash)
- `role` (VARCHAR: 'admin' ou 'professor')
- `created_at` (TIMESTAMP)

### Tabela: rooms
- `id` (UUID, PK)
- `name` (VARCHAR)
- `capacity` (INTEGER)
- `type` (VARCHAR)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

### Tabela: reservations
- `id` (UUID, PK)
- `room_id` (UUID, FK)
- `user_id` (UUID, FK)
- `date` (DATE)
- `start_time` (TIME)
- `end_time` (TIME)
- `status` (VARCHAR: 'pending', 'approved', 'rejected')
- `reason` (TEXT)
- `created_at` (TIMESTAMP)

## 🔒 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário

### Usuários
- `POST /api/users/register` - Cadastrar professor (admin only)
- `GET /api/users/professors` - Listar professores (admin only)

### Salas
- `GET /api/rooms` - Listar todas as salas
- `POST /api/rooms` - Criar sala (admin only)
- `PUT /api/rooms/:id` - Atualizar sala (admin only)
- `DELETE /api/rooms/:id` - Deletar sala (admin only)

### Reservas
- `GET /api/reservations` - Listar reservas
- `POST /api/reservations` - Criar reserva
- `PATCH /api/reservations/:id/status` - Aprovar/Rejeitar (admin only)
- `DELETE /api/reservations/:id` - Cancelar reserva
- `GET /api/reservations/availability/:room_id` - Ver disponibilidade

## 🎨 Customização

### Alterar cores
Edite as variáveis CSS em `frontend/css/style.css`:

```css
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```

### Alterar URL da API
Edite a constante `API_URL` nos arquivos JavaScript do frontend:

```javascript
const API_URL = 'http://localhost:3000/api';
```

## 🛠️ Melhorias Futuras

- [ ] Notificações por email
- [ ] Relatórios de uso das salas
- [ ] Exportação de dados (CSV/PDF)
- [ ] Sistema de comentários nas reservas
- [ ] Calendário visual
- [ ] Aplicativo mobile
- [ ] Recorrência de reservas

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👨‍💻 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências foram instaladas
2. Confirme se as credenciais do Supabase estão corretas
3. Verifique se o servidor backend está rodando
4. Consulte os logs do console do navegador e do terminal

## 🎯 Como Usar

1. **Login**: Acesse a página inicial e faça login com as credenciais
2. **Professor**: 
   - Navegue pelas salas disponíveis
   - Clique em "Reservar" na sala desejada
   - Preencha data, horário e motivo
   - Aguarde aprovação do administrador
3. **Administrador**:
   - Cadastre novos professores
   - Aprove ou rejeite reservas pendentes
   - Gerencie salas e usuários# 🏫 Sistema de Gerenciamento de Salas e Laboratórios

Sistema completo para gerenciamento de reservas de salas e laboratórios com autenticação, controle de permissões e aprovação de reservas.

## 📋 Funcionalidades

### Administrador
- Cadastrar novos professores
- Visualizar todas as reservas pendentes
- Aprovar ou rejeitar reservas
- Gerenciar salas e laboratórios

### Professor
- Visualizar salas disponíveis
- Solicitar reservas de salas
- Visualizar suas próprias reservas
- Cancelar reservas pendentes
- Ver horários ocupados de cada sala

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: Supabase PostgreSQL
- **Frontend**: HTML, CSS, JavaScript puro
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: bcrypt

## 📦 Instalação

### 1. Configurar o Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Acesse o SQL Editor e execute o script SQL fornecido acima para criar as tabelas
4. Copie a URL do projeto e a chave API (anon key)

### 2. Configurar o Backend

```bash
# Navegar para a pasta backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas credenciais do Supabase
# SUPABASE_URL=sua_url_aqui
# SUPABASE_KEY=sua_chave_aqui
# JWT_SECRET=seu_segredo_jwt_aqui
```

### 3. Iniciar o Backend

```bash
# Modo desenvolvimento (com nodemon)
npm run dev

# Ou modo produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

### 4. Configurar o Frontend

```bash
# Navegar para a pasta frontend
cd frontend

# Abrir com Live Server ou servir com qualquer servidor HTTP
# Exemplo com Python:
python -m http.server 8000

# Ou com Node.js:
npx http-server -p 8000
```

Acesse `http://localhost:8000` no navegador

## 🔑 Credenciais Padrão

**Administrador:**
- Email: `admin@sistema.com`
- Senha: `admin123`

## 📁 Estrutura do Projeto

```
projeto/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js          # Configuração Supabase
│   │   ├── middleware/
│   │   │   └── auth.js              # Middleware de autenticação
│   │   ├── routes/
│   │   │   ├── auth.js              # Rotas de autenticação
│   │   │   ├── users.js             # Rotas de usuários
│   │   │   ├── rooms.js             # Rotas de salas
│   │   │   └── reservations.js      # Rotas de reservas
│   │   └── server.js                # Servidor principal
│   ├── package.json
│   └── .env
└── frontend/
    ├── index.html                    # Página de login
    ├── cadastro.html                 # Página de cadastro (admin)
    ├── dashboard.html                # Dashboard principal
    ├── css/
    │   └── style.css                 # Estilos globais
    └── js/
        ├── auth.js                   # Lógica de autenticação
        ├── cadastro.js               # Lógica de cadastro
        └── dashboard.js              # Lógica do dashboard
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: users
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, hash)
- `role` (VARCHAR: 'admin' ou 'professor')
- `created_at` (TIMESTAMP)

### Tabela: rooms
- `id` (UUID, PK)
- `name` (VARCHAR)
- `capacity` (INTEGER)
- `type` (VARCHAR)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

### Tabela: reservations
- `id` (UUID, PK)
- `room_id` (UUID, FK)
- `user_id` (UUID, FK)
- `date` (DATE)
- `start_time` (TIME)
- `end_time` (TIME)
- `status` (VARCHAR: 'pending', 'approved', 'rejected')
- `reason` (TEXT)
- `created_at` (TIMESTAMP)

## 🔒 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário

### Usuários
- `POST /api/users/register` - Cadastrar professor (admin only)
- `GET /api/users/professors` - Listar professores (admin only)

### Salas
- `GET /api/rooms` - Listar todas as salas
- `POST /api/rooms` - Criar sala (admin only)
- `PUT /api/rooms/:id` - Atualizar sala (admin only)
- `DELETE /api/rooms/:id` - Deletar sala (admin only)

### Reservas
- `GET /api/reservations` - Listar reservas
- `POST /api/reservations` - Criar reserva
- `PATCH /api/reservations/:id/status` - Aprovar/Rejeitar (admin only)
- `DELETE /api/reservations/:id` - Cancelar reserva
- `GET /api/reservations/availability/:room_id` - Ver disponibilidade

## 🎨 Customização

### Alterar cores
Edite as variáveis CSS em `frontend/css/style.css`:

```css
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```

### Alterar URL da API
Edite a constante `API_URL` nos arquivos JavaScript do frontend:

```javascript
const API_URL = 'http://localhost:3000/api';
```

## 🛠️ Melhorias Futuras

- [ ] Notificações por email
- [ ] Relatórios de uso das salas
- [ ] Exportação de dados (CSV/PDF)
- [ ] Sistema de comentários nas reservas
- [ ] Calendário visual
- [ ] Aplicativo mobile
- [ ] Recorrência de reservas

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👨‍💻 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências foram instaladas
2. Confirme se as credenciais do Supabase estão corretas
3. Verifique se o servidor backend está rodando
4. Consulte os logs do console do navegador e do terminal

## 🎯 Como Usar

1. **Login**: Acesse a página inicial e faça login com as credenciais
2. **Professor**: 
   - Navegue pelas salas disponíveis
   - Clique em "Reservar" na sala desejada
   - Preencha data, horário e motivo
   - Aguarde aprovação do administrador
3. **Administrador**:
   - Cadastre novos professores
   - Aprove ou rejeite reservas pendentes
   - Gerencie salas e usuários