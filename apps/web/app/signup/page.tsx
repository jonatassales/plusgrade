import { SignupForm } from '@/infra/shadcn/components/signup-form'

export const metadata = {
  title: 'Create account',
  description: 'Create an account',
  keywords: ['create account', 'signup', 'sign up'],
  authors: [{ name: 'Plusgrade', url: 'https://plusgrade.com' }],
  creator: 'Plusgrade',
  publisher: 'Plusgrade',
  openGraph: {
    title: 'Create account',
    description: 'Create an account',
    url: 'https://plusgrade.com',
    siteName: 'Plusgrade',
    images: [{ url: 'https://plusgrade.com/og-image.png' }]
  }
}

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
