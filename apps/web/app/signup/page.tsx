import { SignupForm } from '@/infra/shadcn/components/signup-form'

export default function Page() {
  return (
    <main
      id="main-signup"
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10"
    >
      <h1 className="sr-only">Create account</h1>
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </main>
  )
}
