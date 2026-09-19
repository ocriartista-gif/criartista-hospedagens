# CRM — Motor de prioridade comercial

O CRM do Criartista Hospedagens não é uma lista cronológica de leads. Ele monta uma fila diária de trabalho e explica por que cada contato está naquela posição.

## Filas

### Atender agora
Leads ativos com gatilhos como:
- primeiro contato pendente;
- follow-up vencido ou nas próximas 24 horas;
- contato agendado com o hóspede;
- data de hospedagem próxima;
- cotação enviada sem retorno;
- atendimento antigo sem próximo passo definido.

### Reativar oportunidades
Leads cuja data solicitada ficou no passado e cuja época equivalente volta a se aproximar. O objetivo é permitir campanhas e contato comercial antes da próxima janela provável de viagem.

Leads que já reservaram recebem um pequeno reforço nessa fila por potencial de recompra.

### Nutrir / bloqueado
Contatos sem gatilho comercial imediato ou marcados como não contatar.

## Score explicável

O score é apenas um mecanismo de ordenação. A interface sempre mostra os motivos que geraram a pontuação.

Pesos atuais:
- contato agendado vencido: +75;
- contato agendado em até 24h: +55;
- follow-up vencido: +65;
- follow-up em até 24h: +40;
- check-in em até 7 dias: +50;
- check-in em até 30 dias: +30;
- check-in em até 60 dias: +15;
- lead novo sem contato há mais de 3 dias: +60;
- lead novo sem contato há mais de 24h: +50;
- lead novo sem primeiro contato: +35;
- cotação sem retorno há mais de 3 dias: +35;
- cotação aguardando retorno: +25;
- atendimento sem próximo passo há mais de 3 dias: +20;
- sazonalidade em até 30 dias: +40;
- sazonalidade em até 60 dias: +25;
- hóspede anterior com potencial de recompra: +10;
- prioridade manual: 0–100 configurável.

Níveis:
- 90+: urgente;
- 60–89: alta;
- 30–59: média;
- abaixo de 30: baixa.

## Datas e fuso horário

Cada propriedade possui seu próprio timezone. A Villa Ipê usa `America/Sao_Paulo`. Datas de follow-up e contato são armazenadas como `timestamptz` e exibidas no fuso da propriedade.

## Princípio do produto

O vendedor deve abrir o painel e responder três perguntas sem fazer triagem manual:

1. Quem eu chamo agora?
2. Por que essa pessoa vem antes das outras?
3. Qual é o próximo passo depois desse contato?

A ordem sugerida ajuda o comercial, mas não substitui julgamento humano. O campo de prioridade manual permite representar contexto que o sistema não conhece.


## Histórico comercial imutável

Cada lead possui uma timeline em `lead_activities`. O histórico não é reescrito quando o estado atual do lead muda.

Eventos automáticos atuais:
- lead recebido;
- mudança de status;
- cotação atualizada;
- contato registrado;
- follow-up agendado/removido;
- contato marcado com hóspede;
- troca de responsável;
- atualização das observações comerciais;
- motivo da perda;
- bloqueio/liberação de contato;
- prioridade manual.

Notas independentes também podem ser adicionadas diretamente à timeline.

A tabela possui RLS próprio e não concede UPDATE/DELETE aos usuários comuns, preservando o histórico operacional.

## Responsável pelo lead

`leads.assigned_to` referencia um usuário Auth que também precisa pertencer à mesma propriedade.

Na criação da primeira versão da timeline, leads ativos sem responsável recebem automaticamente o primeiro membro comercial disponível, priorizando:
1. reservas;
2. gerente;
3. proprietário;
4. administrador técnico.

O vendedor pode alterar o responsável na ficha do lead. Toda troca entra na timeline.

## Filtros operacionais

A central do CRM oferece recortes de trabalho sem alterar a prioridade calculada:
- Atender agora;
- Urgentes;
- Follow-up hoje + vencidos;
- Cotação enviada;
- Meus leads;
- Sem responsável;
- Reativar;
- Todos.

O objetivo é permitir que um vendedor trabalhe sua própria carteira e que gerente/proprietário enxerguem a operação completa.

## Alerta na home

Quando há follow-up ou contato marcado vencido, a Visão Geral exibe um alerta comercial antes dos indicadores. A prioridade continua sendo recalculada pelo banco em tempo real.
