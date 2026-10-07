# Arquitetura — NFT Marketplace

## 1. Visão geral

O projeto foi estruturado como uma aplicação React + TypeScript utilizando TanStack Router para navegação, TanStack Query para gerenciamento do estado remoto, Axios para comunicação HTTP, MSW para simulação da API e Socket.IO para atualização de dados em tempo real.

A aplicação foi desenvolvida para funcionar de forma independente de um backend externo durante a demonstração.

---

## 2. Camadas principais

```text
Interface
   │
   ▼
React
   │
   ├── TanStack Router
   │
   ├── TanStack Query
   │
   └── Componentes de interface
           │
           ▼
       Camada HTTP
           │
         Axios
           │
           ▼
          MSW
           │
           ▼
      API simulada
```

As atualizações em tempo real possuem uma camada adicional utilizando Socket.IO.

---

## 3. Roteamento

O TanStack Router é responsável pelo sistema de rotas.

As rotas são utilizadas para:

- páginas públicas;
- páginas autenticadas;
- detalhes de NFTs;
- carrinho;
- checkout;
- confirmação de pedido;
- perfil;
- carteiras.

Rotas que dependem de autenticação verificam a existência de uma sessão válida antes de permitir o acesso.

---

## 4. Estado remoto

O TanStack Query é responsável pelo gerenciamento dos dados provenientes da API.

Isso permite controlar:

- cache;
- loading;
- erro;
- sucesso;
- invalidação;
- refetch;
- sincronização;
- atualização em background.

As mutations são utilizadas para operações como:

- adicionar/remover favoritos;
- adicionar/remover itens do carrinho;
- alterar quantidade;
- aplicação de cupom;
- autenticação;
- operações relacionadas ao checkout.

---

## 5. Comunicação HTTP

O Axios funciona como camada de transporte para as requisições REST.

A comunicação é separada da interface para evitar que os componentes precisem conhecer diretamente os detalhes de implementação da API.

A aplicação trabalha com contratos tipados utilizando TypeScript.

---

## 6. Mock Service Worker

O MSW intercepta as requisições HTTP no navegador.

Isso permite que a aplicação seja executada sem depender de um backend externo.

Os mocks podem representar diferentes situações da API, incluindo:

- respostas de sucesso;
- erros HTTP;
- ausência de dados;
- latência;
- indisponibilidade;
- operações de autenticação;
- operações de carrinho;
- favoritos;
- checkout.

O mocking é controlado pela variável:

```env
VITE_ENABLE_MOCKS=true
```

---

## 7. Persistência

Alguns estados precisam sobreviver à atualização da página.

O carrinho possui persistência local para que os itens adicionados continuem disponíveis depois de um refresh.

A sessão também é utilizada para manter o estado de autenticação conforme o fluxo da aplicação.

---

## 8. Autenticação e isolamento

A aplicação diferencia recursos públicos e privados.

Operações privadas dependem de uma sessão válida.

A arquitetura também considera o isolamento entre usuários para impedir que dados de uma sessão sejam utilizados por outra.

Quando a sessão expira, os recursos privados devem deixar de estar disponíveis e a aplicação pode solicitar uma nova autenticação.

---

## 9. Favoritos

Os favoritos são tratados como dados associados ao usuário autenticado.

As operações principais são:

```text
Adicionar favorito
       │
       ▼
Mutation
       │
       ▼
API
       │
       ▼
Invalidação do cache
       │
       ▼
Interface atualizada
```

O mesmo fluxo é utilizado para remoção.

---

## 10. Carrinho

O carrinho permite:

- adicionar NFTs;
- remover NFTs;
- aumentar quantidade;
- diminuir quantidade;
- verificar disponibilidade;
- aplicar cupom;
- remover cupom;
- calcular subtotal;
- calcular desconto;
- calcular taxa;
- calcular total.

As quantidades são limitadas pela disponibilidade informada pela API.

O estado também possui persistência para sobreviver a atualizações da página.

---

## 11. Checkout

O checkout não considera uma compra como confirmada apenas pela interação visual do usuário.

O fluxo depende de uma resposta da camada de simulação.

Antes da confirmação, são consideradas informações como:

- disponibilidade;
- preço;
- cupom;
- taxa;
- cotação;
- carteira;
- rede.

O fluxo também utiliza idempotência para evitar a criação duplicada de operações.

Estados possíveis incluem:

```text
pending
confirmed
rejected
```

Em caso de falha, a aplicação deve permitir recuperação sem duplicar a operação anterior.

---

## 12. Valores em ETH

Valores financeiros não devem depender exclusivamente de operações comuns de ponto flutuante.

Por isso, valores monetários são representados com precisão adequada, utilizando strings e/ou funções específicas de conversão e formatação.

Isso evita erros comuns de arredondamento associados ao tipo `number`.

---

## 13. Atualizações em tempo real

A aplicação possui suporte a eventos de atualização em tempo real.

Eventos relevantes incluem:

```text
nft.updated
order.updated
```

Eventos podem conter informações de identidade e versão.

A aplicação deve ignorar eventos:

- duplicados;
- antigos;
- incompatíveis com a sessão atual.

Também é importante limpar listeners quando componentes ou sessões deixam de existir, evitando múltiplas inscrições para o mesmo evento.

---

## 14. Cache e sincronização

O TanStack Query é utilizado para manter os dados remotos sincronizados.

Depois de mutations, queries relacionadas podem ser invalidadas para garantir que a interface não permaneça utilizando dados antigos.

A estratégia também permite lidar com:

- refetch;
- atualizações em background;
- recuperação após erro;
- mudanças de sessão.

---

## 15. Estados de interface

As telas devem considerar diferentes estados da comunicação com a API.

### Loading

Exibição de skeletons ou indicadores enquanto os dados estão sendo carregados.

### Empty

Exibição de uma mensagem apropriada quando não existem resultados.

### Error

Exibição de uma mensagem de erro e possibilidade de recuperação quando aplicável.

### Success

Renderização normal dos dados recebidos.

### Background update

A interface pode continuar apresentando os dados atuais enquanto uma atualização ocorre em segundo plano.

---

## 16. Testes E2E

Os testes utilizam Playwright e executam os fluxos pela interface real da aplicação.

A estratégia evita testar apenas funções internas ou chamadas artificiais.

Os cenários cobrem funcionalidades como:

- autenticação;
- proteção de rotas;
- sessão;
- catálogo;
- favoritos;
- carrinho;
- cupons;
- checkout.

Os testes podem ser executados com:

```bash
npx playwright test
```

Relatório:

```bash
npx playwright show-report
```

---

## 17. Mock e testes

O uso de MSW permite que os testes executem contra uma camada de API controlada.

Isso facilita a reprodução de cenários determinísticos sem depender de serviços externos.

Os testes podem validar o comportamento da aplicação diante de diferentes respostas da API.

---

## 18. Build e deploy

A aplicação pode ser compilada com:

```bash
npm run build
```

A versão compilada pode ser validada localmente utilizando:

```bash
npm run preview
```

Para ambientes de demonstração, os mocks podem permanecer habilitados através de:

```env
VITE_ENABLE_MOCKS=true
```

---

## 19. Considerações

A arquitetura prioriza a separação entre:

```text
Interface
   ↓
Roteamento
   ↓
Estado remoto
   ↓
Comunicação HTTP
   ↓
API / Mock
```

Essa separação facilita a substituição da camada mock por uma API real posteriormente, mantendo a maior parte da interface e das regras de estado independentes da implementação do backend.