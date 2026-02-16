import { LoginForm } from '@/infra/shadcn/components/login-form'

export default function Page() {
  return (
    <main
      id="main-login"
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10"
    >
      <h1 className="sr-only">Login</h1>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  )
}
