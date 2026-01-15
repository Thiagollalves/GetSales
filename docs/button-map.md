# Mapeamento de botões

Este documento lista os botões do produto, suas funções e o comportamento associado.

## Dashboard

| Tela/Componente | Botão | Função/handler | Comportamento esperado |
| --- | --- | --- | --- |
| Campanhas | Enviar Campanha Agora | `handleSendCampaign` | Dispara envio da campanha e atualiza o progresso. |
| Campanhas | Novo Modelo / Cancelar | `setIsCreatingTemplate` | Alterna o formulário de criação de modelo. |
| Campanhas | Salvar e Enviar para Aprovação | `handleCreateTemplate` | Cria um template mock e confirma via toast. |
| Pipeline | Filtros | `handleFilterClick` | Abre o painel de filtros (toast informativo). |
| Pipeline | Novo Lead (header) | `handleAddLead` | Cria um lead na primeira etapa disponível. |
| Pipeline | Opções da etapa | `handleStageOptions` | Abre opções da etapa (toast informativo). |
| Pipeline | + Lead (por etapa) | `handleAddLead` | Cria um lead na etapa selecionada. |
| Pipeline | Nova Etapa | `handleAddStage` | Adiciona uma nova etapa vazia ao pipeline. |
| Contatos | Importar | `handleImportContacts` | Inicia fluxo de importação (toast informativo). |
| Contatos | Novo Contato | `handleAddContact` | Abre cadastro de contato (toast informativo). |
| Contatos | Editar | `handleEditContact` | Abre edição do contato selecionado. |
| Chatbots | Novo Agente | `handleNewAgent` | Abre fluxo para criação de agente (toast informativo). |
| Inbox > Lista | Filtros | `handleFilter` | Abre filtros da inbox (toast informativo). |
| Inbox > Lista | Conversa | `onSelect` | Seleciona a conversa na lista. |
| Inbox > Chat | Ligar | `handleStartCall` | Dispara chamada de voz (toast informativo). |
| Inbox > Chat | Vídeo | `handleStartVideo` | Dispara chamada de vídeo (toast informativo). |
| Inbox > Chat | Perfil | `onToggleProfile` | Abre/fecha o painel lateral do contato. |
| Inbox > Chat | Mais opções | `handleMoreOptions` | Abre ações adicionais (toast informativo). |
| Inbox > Chat | Anexar arquivo | `handleAttachFile` | Abre seletor e envia anexos. |
| Inbox > Chat | Enviar imagem | `handleAttachImage` | Faz upload de imagens e vídeos. |
| Inbox > Chat | Emojis | `handleEmojiPicker` | Abre seletor de emojis embutido. |
| Inbox > Chat | Áudio | `handleVoiceNote` | Grava e envia áudio. |
| Inbox > Chat | Enviar | `handleSend` | Envia mensagem e atualiza conversa. |
| Inbox > Perfil | Editar | `handleEditProfile` | Abre formulário editável do contato. |
| Inbox > Perfil | + Adicionar tag | `handleAddTag` | Cria tags customizadas. |
| Inbox > Perfil | Ligar | `handleCall` | Inicia chamada (toast informativo). |
| Inbox > Perfil | Agendar reunião | `handleScheduleMeeting` | Abre mini-calendário para escolha de data. |
| Inbox > Perfil | Bloquear contato | `handleBlock` | Solicita confirmação de bloqueio (toast informativo). |
| Automações (lista) | Nova Automação | `onCreate` | Abre o construtor para uma nova automação. |
| Automações (lista) | Menu: Editar | `handleMenuAction` | Aciona fluxo de edição (toast informativo). |
| Automações (lista) | Menu: Duplicar | `handleMenuAction` | Duplica automação (toast informativo). |
| Automações (lista) | Menu: Pausar/Ativar | `handleMenuAction` | Alterna status (toast informativo). |
| Automações (lista) | Menu: Excluir | `handleMenuAction` | Remove automação (toast informativo). |
| Automações (builder) | Voltar | `onBack` | Retorna à lista. |
| Automações (builder) | Testar | `handleTestAutomation` | Executa teste rápido (toast informativo). |
| Automações (builder) | Salvar | `handleSaveAutomation` | Salva automação (toast informativo). |
| Automações (builder) | Itens da paleta de componentes | `addNode` | Adiciona um componente ao fluxo. |
| Automações (builder) | Adicionar etapa | `addNode` | Cria uma nova etapa no fluxo. |
| Header do dashboard | Notificações | `handleNotifications` | Abre central de notificações (toast informativo). |
| Header do dashboard | Nova conversa | `handleNewConversation` | Abre a inbox e cria uma nova conversa. |
| Sidebar do dashboard | Menu mobile (abrir/fechar) | `setMobileOpen` | Alterna visibilidade no mobile. |
| Sidebar do dashboard | Sair | `handleLogout` | Encerra sessão (toast informativo). |

## Landing page

| Seção | Botão | Função/handler | Comportamento esperado |
| --- | --- | --- | --- |
| Header | Português / English / Español | `handleLanguageChange` | Alterna idioma (toast informativo). |
| Header | Agendar demonstração | Link para `/dashboard` | Navega para o dashboard. |
| Hero | Começar agora | Link para `/dashboard` | Navega para o dashboard. |
| Hero | Ver demonstração | Link para `#demo` | Scroll para a seção de demo. |
| Landing pages | Ver modelos / Criar formulário / Ativar agora | `handleFeatureAction` | Abre ação correspondente (toast informativo). |
| CTA final | Falar com especialistas | Link para `/dashboard` | Navega para o dashboard. |
| Sidebar | Menu mobile (abrir/fechar) | `setMobileOpen` | Alterna visibilidade no mobile. |
| Sidebar | Navegação por âncoras | `setActiveItem` | Atualiza item ativo e fecha menu no mobile. |
| Sidebar | Começar agora | Link para `/dashboard` | Navega para o dashboard. |

## WhatsApp

| Componente | Botão | Função/handler | Comportamento esperado |
| --- | --- | --- | --- |
| Configuração API | Salvar Configurações | `handleSave` | Salva credenciais no localStorage. |
| QR Connection | Gerar QR Code | `generateQr` | Gera um QR para conectar ao WhatsApp. |
| QR Connection | Desconectar | `handleDisconnect` | Encerra a sessão atual. |
