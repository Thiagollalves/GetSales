# AGENTS

## Local workflow
- `npm install` puxa as dependências do `package.json` (Next.js 16, Radix UI, Supabase, Sonner etc.). Use `npm run dev` para rodar o servidor local, `npm run build`/`npm run start` para produção e `npm run lint` para verificar regras.
- `docs/mvp-setup.md` lista as variáveis necessárias para Meta WhatsApp (`META_WHATSAPP_TOKEN`, `META_PHONE_NUMBER_ID`, `META_VERIFY_TOKEN`, `META_GRAPH_API_VERSION`), Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, tabela `whatsapp_messages`) e n8n (`N8N_WEBHOOK_URL`), além de um template da tabela com o `curl` de `POST /api/whatsapp/send`.

## Chatbot workflows
- `app/dashboard/chatbots/page.tsx` busca `GET /api/chatbots/flows` e `GET /api/chatbots/agents`, entrega os botões `toggleFlow`, `runFlowTest`, `handleFlowSave` e `handleAgentSave` e rendeiza toasts via Sonner quando qualquer ação falha ou conclui.
- `GET /api/chatbots/flows` responde with `listFlows()`, `POST /api/chatbots/flows` exige `{ name, trigger, conversations, active }` e empilha um flow com `nextFlowId`, `PATCH /api/chatbots/flows` só troca o `active` (usa `updateFlow`), enquanto `POST /api/chatbots/flows/{id}/test` chama `runFlowTest(id)` e atualiza `lastTestScore`/`lastTestStatus` com valores randômicos exibidos nos badges do card.
- `GET /api/chatbots/agents` retorna `listAgents()` e `POST /api/chatbots/agents` valida `name`, `channel`, `focus` e `status` (só aceita “Ativo”, “Em teste” e “Pausado”), cria o agente com `nextAgentId` e joga no topo da lista usada pelo dashboard.

## Automation workflows
- `app/dashboard/automation/page.tsx` renderiza `AutomationList` e dispara o builder fictício (`AutomationBuilder`) para novos fluxos ou itens existentes.
- `components/dashboard/automation/automation-list.tsx` mostra o mock `AutomationList`, usa `notifyAction` para o menu de contexto (Editar, Duplicar, Pausar/Ativar, Excluir) e abre o builder ao clicar em qualquer automação ou no botão “Nova Automação”.
- `components/dashboard/automation/automation-builder.tsx` deixa o usuário nomear a automação, arrastar/remover/reordenar nós e montar triggers (tempo de inatividade, formulário enviado, e-mail aberto, mensagem recebida), ações (enviar WhatsApp/e-mail, atualizar status, criar lead, alterar score, mover funil), condições (score/tag/etapa) e delays (1h, 24h, 3 dias).
- Os botões “Testar” e “Salvar” do builder, assim como os itens de menu, chamam `notifyAction(...)` para exibir toasts de sucesso/falha.

## WhatsApp + integrações
- `app/api/whatsapp/send/route.ts` recebe `{ phone, message }`, permite sobrescrever token e phoneId antes de cair nas variáveis de ambiente Meta (`META_*`) e responde com o payload simulado, permitindo que o front teste envios via `fetch("/api/whatsapp/send")`.
- `app/api/whatsapp/webhook/route.ts` valida `hub.mode`/`hub.verify_token` com `META_VERIFY_TOKEN`, responde com o `hub.challenge`, grava cada entry em `whatsapp_messages` via `getSupabaseAdminClient()` e repassa o evento para `N8N_WEBHOOK_URL` com `{ source: "meta-whatsapp" }`.
- O `docs/mvp-setup.md` explica como criar o app Meta, apontar o webhook para `/api/whatsapp/webhook` e provisionar Supabase + n8n.

## UI command references
- `docs/button-map.md` lista quais botões do dashboard (campanhas, pipeline, contatos, chatbots, inbox, automações, cabeçalho, landing) disparam `handleSendCampaign`, `handleFilterClick`, `handleAddContact`, `handleNewAgent`, `handleStartCall`, `handleTestAutomation`, `handleSaveAutomation` etc.
- `lib/button-actions.ts` expõe `notifyAction(title, description?)`, usado por automações, pipeline, contatos, inbox, landing e barra lateral para mostrar confirmações e toasts.

## Campaigns & templates
- `app/dashboard/campaigns/page.tsx` divide em duas abas; “Disparo em Massa” filtra a audiência (`initialConversations` em `lib/mock-data.ts`) por `selectedTag`, calcula um badge estimado e chama `handleSendCampaign`, que simula o progresso com `setTimeout` e `progress` exibindo toasts de início/progresso/êxito (o comentário explica que ali viraria `POST /api/whatsapp/send`).
- `handleCreateTemplate` cria um `Template` (tipo definido em `lib/mock-data.ts`) com `name`, `category`, `language`, `status` e `components`, atualiza o estado `templates`, limpa o form e mostra um toast de sucesso. O botão “Novo Modelo / Cancelar” alterna `setIsCreatingTemplate` para exibir o formulário.
- Quando `selectedTemplate` existe, o card mostra o texto do componente `BODY`; “Enviar Campanha Agora” relembra `handleSendCampaign` e mostra spinner via `Loader2` enquanto `isSending` está true.

## Pipeline board
- `app/dashboard/pipeline/page.tsx` só carrega o componente cliente `components/dashboard/pipeline/board.tsx`, que monta o tabuleiro completo.
- O board usa `@dnd-kit/core` com sensores `Mouse`, `Touch` e `Keyboard`, `SortableContext` e `DragOverlay` para arrastar leads entre etapas, reordenar dentro da mesma etapa e exibir um cartão flutuante enquanto arrasta.
- O cabeçalho mostra o total de leads e o potencial financeiro, inclui uma busca (`setSearchTerm`) que filtra por nome ou empresa e um botão de filtros que dispara `notifyAction("Filtros do pipeline", "Abra o painel de filtros para segmentar seus leads.")`.
- `handleAddLead(stageId)` cria um lead com dados placeholder, adiciona no topo da etapa escolhida e dispara `notifyAction("Lead adicionado", ...)`; `handleAddStage()` adiciona uma nova etapa com cor do palette e mantém um botão “Nova Etapa” no final; `handleRenameStage` abre `window.prompt` para renomear e `handleRemoveStage` impede excluir a última etapa.
- Cada etapa mostra badge com contagem, total financeiro e um menu `DropdownMenu` para renomear/excluir; `SortableLead` usa drag handle (`GripVertical`), mostra valor, último contato, pontuação e botão de editar que ativa o card de edição abaixo do cabeçalho.
- O card de edição permite alterar nome, empresa, canal (WhatsApp/Instagram/Telegram/E-mail), valor, pontuação e último contato; `handleSaveLead` aplica as mudanças e limpa o estado.

## Contacts management
- `app/dashboard/contacts/page.tsx` usa React Hook Form + Zod (`contactFormSchema`) para criar/editar contatos em um `Dialog`, validando `name`, `channel` e `status` (`novo`, `ativo`, `resolvido`) e respeitando campos opcionais (`phone`, `email`, `tags`). A listagem renderiza tabela com avatar, canal, status, tags e botão “Editar”.
- O upload CSV aceita colunas com aliases (`FIELD_ALIASES` normaliza cabeçalhos como nome/contato/fullname, canal/origem, telefone/phone etc.), extrai tags com `parseTagsFromCsv`, monta `Conversation` com `generateAvatarInitials` e insere no topo da lista; arquivos inválidos ou vazios acionam toasts via `notifyAction`.
- O botão “Download template” monta um `Blob` com `CONTACT_FILE_HEADER = ["Nome","Canal","Telefone","Email","Tags","Status"]` e força download (`handleDownloadTemplate`). O botão “Importar contatos” abre o seletor de arquivo e chama `handleCsvUpload` (notifica erros de leitura e sucesso de importação).
- `notifyAction` também exibe mensagens em `handleDialogSubmit` (contato criado/atualizado) e em `handleExport` (`notifyAction("Exportação pronta", ...)`).

## Inbox & conversations
- `app/dashboard/inbox/page.tsx` empilha `ConversationList`, `ChatWindow` e `ContactProfile`, inicializa a lista com `initialConversations`, persiste no `localStorage` (`inbox_conversations`) e escuta `dashboard:new-conversation` para criar threads extras com nomes automáticos.
- `ConversationList` mantém filtro texto e notifica `notifyAction("Filtros da inbox", "Abra filtros para segmentar conversas.")` ao clicar no botão de filtro, dando destaque visual para conversas não lidas.
- `ChatWindow` oferece quick replies, emojis, anexos (arquivo, imagem, vídeo), gravação de voz com `MediaRecorder` e usa `notifyAction` para chamadas de voz/vídeo e menu “Mais opções”. `handleSend` limpa o campo após chamar `onSendMessage`; `handleSendAttachment` compartilha `Attachment` com URLs criados por `URL.createObjectURL()`.
- `InboxPage` usa `toast.promise` ao enviar texto via `/api/whatsapp/send`, lendo tokens de `localStorage` (`wh_access_token`, `wh_phone_id`) e o telefone do contato; o toast mostra estados loading/success/error e o fetch só dispara se houver token, phoneId e número de telefone.
- `ContactProfile` mostra avatar, tags, lead score com slider (chama `onUpdateScore`), botão “Editar” que troca para inputs (status, responsável, nome, telefone, e-mail, localização, “cliente desde”) e opções de ligar/bloquear/reunião com `notifyAction`. O popover do calendário envia a data para `handleScheduleMeeting`, dispara `notifyAction("Reunião agendada", ...)` e atualiza `nextMeeting`.

## TODO
- Conectar pipeline, contatos e inbox aos endpoints reais (hoje todo o fluxo ainda está em memória e usa `notifyAction`/toasts no lugar de requests genuínos).
