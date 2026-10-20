# To-do Markdown

Gerenciador de tarefas local feito com HTML, CSS, JavaScript e Node.js. O arquivo `tasks.md` guarda as tarefas; a interface permite atualizá-las e salva as alterações automaticamente nele.

## Funcionalidades

- Carrega tarefas de `tasks.md`.
- Exibe títulos Markdown e tarefas pendentes ou concluídas.
- Permite adicionar, concluir, reabrir e excluir tarefas.
- Salva automaticamente as alterações no arquivo.
- Mostra o estado do carregamento e do salvamento.

## Requisitos

- Node.js e npm

## Instalação e execução

Instale as dependências:

```bash
npm install
```

Crie `tasks.md` na raiz do projeto, no mesmo nível de `server.js`. Exemplo:

```md
# Meu To-do

## Hoje
- [ ] Revisar o projeto
- [x] Criar a lista
```

Inicie o servidor:

```bash
node server.js
```

Abra [http://localhost:3000](http://localhost:3000) no navegador. Para parar o servidor, use `Ctrl+C` no terminal.

## Formato das tarefas

O app reconhece itens como:

```md
- [ ] Tarefa pendente
- [x] Tarefa concluída
```

Também pode exibir títulos iniciados com `#`. Outros textos aparecem como notas simples; o app não interpreta todos os recursos de Markdown.

## Dados locais

`tasks.md` contém suas tarefas e deve ficar fora do repositório se você não quiser publicá-las. Adicione estes padrões ao `.gitignore`:

```gitignore
/node_modules/
/tasks.md
```

