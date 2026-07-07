export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm tracking-[0.2em] text-muted uppercase">Raízes</p>
          <h1 className="font-display mt-2 text-3xl text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-sm text-muted">
            Digite a senha para acessar suas tarefas.
          </p>
        </div>

        <form action="/api/login" method="POST" className="glass-panel rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="w-full rounded-md border border-border bg-background-soft px-3 py-2.5 text-foreground outline-none transition focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-sm text-danger">Senha incorreta. Tente novamente.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-accent-foreground transition hover:bg-accent-strong"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
