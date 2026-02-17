import { redirect } from 'next/navigation'

import { Header } from '@/app/_components'
import { IncomeTaxCalculator } from './_features/income-tax/ui/IncomeTaxCalculator'

export const metadata = {
  title: 'Plusgrade',
  description: 'Plusgrade is a platform for calculating income tax',
  keywords: ['plusgrade', 'income tax', 'tax calculator'],
  authors: [{ name: 'Plusgrade', url: 'https://plusgrade.com' }],
  creator: 'Plusgrade',
  publisher: 'Plusgrade',
  openGraph: {
    title: 'Plusgrade',
    description: 'Plusgrade is a platform for calculating income tax',
    url: 'https://plusgrade.com',
    siteName: 'Plusgrade',
    images: [{ url: 'https://plusgrade.com/og-image.png' }]
  }
}

interface HomeProps {
  searchParams: Promise<{
    income?: string | string[]
    year?: string | string[]
  }>
}

function getSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return value ?? ''
}

export default async function Home(props: HomeProps) {
  const isAuthenticated = true // TODO: replace with actual authentication check

  const searchParams = await props.searchParams
  const income = getSearchParam(searchParams.income)
  const year = getSearchParam(searchParams.year)

  if (!isAuthenticated) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        id="main-home"
        className="flex flex-1 justify-center items-center screen-padding"
      >
        <div className="max-w-md w-full">
          <IncomeTaxCalculator income={income} year={year} />
        </div>
      </main>
    </div>
  )
}
