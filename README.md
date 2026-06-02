# 🌸 Encantos da Faby 🌸

> Um e-commerce premium, elegante e completo para produtos artesanais e personalizados. Desenvolvido sob medida para proporcionar a melhor experiência de compra, com uma interface visual encantadora, alta performance e integrações robustas de back-end.

🌐 **Acesse a aplicação em produção:** [encantos-da-faby.web.app](https://encantos-da-faby.web.app)

---

## ✨ Recursos da Aplicação

O **Encantos da Faby** foi totalmente reconstruído do zero com foco em estabilidade, performance e design premium. Suas principais funcionalidades incluem:

### 1. 🛍️ Catálogo de Produtos Interativo
* Exibição em **Bento Grid** com animações suaves e efeito de hover premium.
* Filtros dinâmicos por categoria e barra de pesquisa inteligente em tempo real.
* Página dedicada de detalhes do produto (`produto.html`) com galeria de miniaturas de imagens extras, descrição completa em sanfona (accordion) e carrossel de produtos relacionados.

### 2. 🔐 Sistema de Autenticação e Perfil de Cliente (`perfil.html`)
* Login, cadastro e gerenciamento de conta via **Firebase Auth**.
* Painel do cliente para alteração de dados pessoais (Nome, Endereço de Entrega, Senha).
* Upload de foto de perfil (Avatar) integrado ao **Firebase Storage**.
* Histórico de pedidos detalhado e integrado em tempo real com o Firestore.

### 3. 🛒 Carrinho de Compras e Checkout Seguro (`index.html` & `produto.html`)
* Drawer lateral responsivo com atualização em tempo real do contador e somatório total.
* Checkout inteligente integrado ao **Mercado Pago (Card & Pix Bricks)**.
* Geração de pedido no banco de dados e redirecionamento direto para o WhatsApp para acompanhamento humanizado.

### 4. 👑 Painel Administrativo de Controle (`admin.html`)
Área de controle restrita para a **Fabíola** (`fabiola@encantosdafaby.com.br`) com:
* **CRUD Completo de Produtos**: Criação, edição e exclusão de itens do catálogo com suporte a upload de imagem de capa e imagens extras (galeria).
* **Gerenciador de Pedidos**: Alteração de status de entrega de pedidos em tempo real (Pendente, Pago, Enviado, Entregue, Cancelado).
* **Relatórios Financeiros e Métricas**: Gráficos e painéis com faturamento mensal, total de pedidos, tíquete médio e contagem de usuários.
* **Configurações da Loja**: Customização de dados de contato (WhatsApp de atendimento) e chave de produção do Mercado Pago.

---

## 🛠️ Stack Tecnológica

O projeto utiliza tecnologias modernas e robustas para garantir segurança e escalabilidade:

* **Frontend**: HTML5 Semântico, CSS3 Moderno (Custom Properties, Flexbox, Grid e animações refinadas) e JavaScript ES6+ modular.
* **Banco de Dados & Storage**: **Firebase Firestore** para dados estruturados de alta velocidade e **Firebase Storage** para assets dinâmicos.
* **Autenticação**: **Firebase Authentication** com regras seguras.
* **Pagamentos**: SDK do **Mercado Pago** para processamento seguro via Cartão de Crédito e Pix.
* **Hospedagem**: **Firebase Hosting** com deploy rápido e CDN global.

---

## 📁 Estrutura do Projeto

```bash
encantos-da-faby/
├── 📁 E-commerce/                  # Código-fonte da aplicação web
│   ├── index.html                 # Página inicial (Loja & Catálogo)
│   ├── produto.html               # Detalhes do Produto (Galeria & Info)
│   ├── perfil.html                # Área do Cliente (Dados, Endereço, Pedidos)
│   ├── admin.html                 # Painel Administrativo (CRUD, Pedidos, Config)
│   ├── style.css                  # Design System completo e responsivo (Vanilla CSS)
│   ├── 📁 js/                      # Módulos JavaScript (Arquitetura limpa)
│   │   ├── firebase.js            # Inicialização e conexões do Firebase
│   │   ├── auth.js                # Lógica de login, registro e perfil do usuário
│   │   ├── ui.js                  # Feedbacks visuais, modais, carrosséis e Toasts
│   │   ├── cart.js                # Controle de estado da sacola de compras
│   │   ├── catalog.js             # Gestão do catálogo e carga inicial de 32 produtos
│   │   ├── checkout.js            # Integração com Mercado Pago e geração de pedidos
│   │   ├── perfil.js              # Interações e atualização do perfil do usuário
│   │   └── admin.js               # Dashboard, relatórios e CRUD da Fabíola
│   └── 📁 assets/images/           # Imagens oficiais dos produtos
├── 📄 .gitignore                  # Arquivos ignorados pelo Git
└── 📄 README.md                   # Documentação oficial do projeto
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de ter instalado o [Node.js](https://nodejs.org/).

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/silvacknicolas/encantos-da-faby.git
   cd encantos-da-faby/E-commerce
   ```

2. **Inicie um servidor local:**
   Para testar a aplicação localmente de forma simples, você pode usar o pacote `live-server` ou o próprio servidor do Firebase:
   ```bash
   # Utilizando npx para um servidor leve e rápido
   npx live-server
   ```
   *Ou utilizando o emulador de hosting do Firebase:*
   ```bash
   npx firebase emulators:start
   ```

3. **Deploy para Produção:**
   Se tiver credenciais administrativas do projeto no Firebase:
   ```bash
   npx firebase-tools deploy --only hosting --project encantos-da-faby
   ```

---

<p align="center">
  Desenvolvido com carinho para o projeto <b>Encantos da Faby</b> ✨
</p>
