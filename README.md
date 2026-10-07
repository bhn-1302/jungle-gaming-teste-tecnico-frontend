# NFT Marketplace

Marketplace de NFTs desenvolvido em React + TypeScript, com foco em catálogo, autenticação, favoritos, carrinho, checkout, mocks de API, atualização em tempo real e testes E2E.

## Stack

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Axios
- REST APIs
- Socket.IO / Socket.IO Client
- Tailwind CSS
- shadcn/ui
- MSW (Mock Service Worker)
- Playwright

## Funcionalidades

### Catálogo

- Listagem de NFTs
- Busca
- Filtros
- Ordenação
- Paginação
- Estados de loading, vazio e erro
- Consulta por parâmetros de URL
- Acesso direto aos detalhes de um NFT
- Tratamento de NFT inexistente

### Detalhes do NFT

- Informações do NFT
- Disponibilidade
- Controle de quantidade
- Adição ao carrinho
- Favoritos
- Tratamento de indisponibilidade

### Autenticação

- Cadastro
- Login
- Logout
- Persistência de sessão
- Proteção de rotas privadas
- Tratamento de sessão expirada
- Isolamento de dados entre usuários

### Favoritos

- Adicionar e remover favoritos
- Persistência
- Proteção para usuários não autenticados
- Atualização e invalidação de cache

### Carrinho

- Adicionar itens
- Alterar quantidade
- Remover itens
- Controle de disponibilidade
- Persistência após atualização da página
- Aplicação e remoção de cupom
- Cálculo de subtotal
- Desconto
- Taxa de rede
- Total
- Valores em ETH preservando precisão
- Referência da cotação

### Checkout

- Validação dos dados
- Simulação de carteira e rede
- Revalidação de preço, disponibilidade, cupom e taxas
- Idempotência
- Estados de pagamento pendente, confirmado e rejeitado
- Recuperação de falhas
- Snapshot dos dados da compra na confirmação

### Atualizações em tempo real

O projeto possui integração para atualização de dados em tempo real utilizando eventos como:

- `nft.updated`
- `order.updated`

Os eventos consideram identidade e versão para evitar processamento incorreto de eventos antigos ou duplicados.

## Mock API

O projeto utiliza MSW para interceptar as requisições da aplicação durante o desenvolvimento e no build de demonstração.

Para habilitar os mocks:

```env
VITE_ENABLE_MOCKS=true
```

## Instalação

Clone o projeto e instale as dependências:

```bash
npm install
```

## Desenvolvimento

Execute:

```bash
npm run dev
```

Com os mocks habilitados:

```env
VITE_ENABLE_MOCKS=true
```

## Build

Para gerar a versão de produção:

```bash
npm run build
```

## Preview

Depois do build:

```bash
npm run preview
```

## Testes E2E

Executar os testes:

```bash
npx playwright test
```

Executar em modo de interface:

```bash
npx playwright test --ui
```

Abrir o relatório:

```bash
npx playwright show-report
```

Os testes cobrem os principais fluxos da aplicação, incluindo autenticação, proteção de rotas, catálogo, favoritos, carrinho, cupom, sessão e checkout.

## Arquitetura

A aplicação utiliza:

```text
React
  │
  ├── TanStack Router
  │     └── Rotas e proteção de páginas
  │
  ├── TanStack Query
  │     └── Estado remoto e cache
  │
  ├── Axios
  │     └── Comunicação HTTP
  │
  ├── MSW
  │     └── API simulada
  │
  └── Socket.IO
        └── Atualizações em tempo real
```

### Router

O TanStack Router é responsável pela navegação e pelas rotas da aplicação.

Rotas privadas possuem proteção para impedir acesso sem sessão válida.

### Estado remoto

O TanStack Query gerencia:

- cache
- loading
- erros
- invalidação
- refetch
- atualização de dados
- sincronização entre componentes

### HTTP

O Axios é utilizado como camada de comunicação com a API.

As operações são tipadas utilizando TypeScript.

### Mocking

O MSW intercepta as chamadas de API e permite executar a aplicação sem um backend externo.

Isso possibilita reproduzir cenários como:

- sucesso
- loading
- ausência de dados
- erros HTTP
- indisponibilidade
- latência
- atualização de dados

### Carrinho

O carrinho possui estado persistente para permitir que os itens permaneçam disponíveis após uma atualização da página.

### Autenticação

A sessão é utilizada para proteger recursos privados e evitar que dados de usuários diferentes sejam compartilhados.

### Valores em ETH

Valores financeiros são tratados como strings/valores de precisão apropriados para evitar problemas de arredondamento causados pelo uso direto de `number` em operações financeiras.

## Testes

Os testes automatizados utilizam Playwright e validam fluxos diretamente pela interface da aplicação.

Entre os cenários estão:

- Login
- Proteção de rotas
- Persistência de sessão
- Catálogo
- Favoritos
- Carrinho
- Cupom
- Checkout
- Tratamento de estados de erro

## Variáveis de ambiente

A aplicação utiliza variáveis de ambiente para controlar recursos de execução.

Exemplo:

```env
VITE_ENABLE_MOCKS=true
```

Em um ambiente de demonstração sem backend externo, essa variável deve permanecer habilitada para que a API simulada seja carregada.

## Deploy

O projeto pode ser publicado como aplicação Vite em serviços de hospedagem estática, como a Vercel.

Durante a configuração do projeto, utilizar:

```env
VITE_ENABLE_MOCKS=true
```

Após o deploy, é importante validar:

- carregamento da Home
- login
- acesso às rotas privadas
- catálogo
- detalhes
- favoritos
- carrinho
- checkout
- atualização da página em rotas internas
- funcionamento dos mocks

## Limitações

A aplicação utiliza uma API simulada para permitir a execução independente de um backend externo.

Por isso, dados e operações apresentados durante a demonstração pertencem ao ambiente mock da aplicação.

## Documentação adicional

Para detalhes sobre as decisões estruturais do projeto, consulte:

`ARCHITECTURE.md`