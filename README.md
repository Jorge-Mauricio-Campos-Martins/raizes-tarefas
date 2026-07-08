# Raízes — Tarefas

App pessoal de tarefas: capture por voz ou texto no celular, a Gemini API organiza em tarefas estruturadas (título, descrição, prazo, prioridade), e você organiza tudo num quadro Kanban por projeto/área de vida.

## Stack

- **Next.js** (App Router, TypeScript) — hospedado na **Vercel**
- **Supabase** — Postgres (tarefas/projetos/anexos) + Storage (arquivos anexados)
- **Gemini API** (Google AI Studio, camada gratuita) — organiza o texto capturado em tarefas estruturadas
- **Groq + Whisper** (camada gratuita) — transcrição de voz de alta qualidade a partir do áudio gravado (`MediaRecorder`, limite de 3 minutos por gravação)
- **@dnd-kit** — drag-and-drop do Kanban, com bom suporte a toque no celular

## Configuração local

1. Instale as dependências (já feito se você clonou este repo pronto):
   ```bash
   npm install
   ```

2. Crie um projeto em [supabase.com](https://supabase.com) (escolha uma região próxima, ex. São Paulo).

3. Rode a migração em `supabase/migrations/0001_init.sql` no SQL Editor do Supabase — ela cria as tabelas, ativa RLS, cria o bucket privado `task-attachments` e semeia seus projetos iniciais (Edu Farah, Jornada do Propósito, YouTube, etc.).

4. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — em Project Settings → API no Supabase (a service role key é secreta, nunca exponha).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — mesma tela.
   - `GEMINI_API_KEY` — gere gratuitamente em [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
   - `GROQ_API_KEY` — gere gratuitamente em [console.groq.com/keys](https://console.groq.com/keys).
   - `APP_PASSWORD` — a senha única que você vai usar para entrar no app.
   - `AUTH_SECRET` — gere com `openssl rand -base64 32` (ou qualquer string longa aleatória).

5. Rode localmente:
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) — vai pedir a senha (`APP_PASSWORD`) antes de mostrar o quadro.

## Deploy na Vercel

1. Suba este repositório para o GitHub.
2. Em [vercel.com](https://vercel.com), importe o repositório (o framework Next.js é detectado automaticamente).
3. Em Project Settings → Environment Variables, adicione as mesmas 7 variáveis do `.env.local`.
4. Deploy. Acesse a URL gerada pelo celular, entre com a senha, e comece a capturar tarefas.

## Estrutura

- `app/api/capture` — recebe texto digitado e chama a Gemini API para extrair tarefas.
- `app/api/capture/audio` — recebe o áudio gravado, transcreve via Groq/Whisper e reaproveita a mesma extração da Gemini.
- `app/api/tasks`, `app/api/projects`, `app/api/attachments` — CRUD do quadro, sempre via service role key (o navegador nunca acessa o Supabase diretamente).
- `components/kanban/` — o quadro arrastável.
- `components/capture/` — botão flutuante, gravação de voz, fallback de texto e a tela de revisão antes de salvar.
- `components/task/` — detalhe da tarefa e anexos.
- `middleware.ts` — proteção por senha única (pode ser removida se você preferir deixar o app sem nenhuma proteção).

## Roadmap (ideias futuras, não implementadas)

- Sincronizar prazos com Google Calendar.
- Anexos direto do Google Drive.
- Widget de playlist de foco via Spotify.
- Puxar calendário de uploads dos canais do YouTube.
- Resumo semanal por email com prazos e tarefas paradas.
- Escalonamento automático de prioridade conforme o prazo se aproxima.
- Painel de quantas tarefas cada projeto está acumulando ao longo do tempo.
