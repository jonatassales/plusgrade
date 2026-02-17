import { Skeleton } from '@/infra/shadcn/components/ui/skeleton'
import { type IncomeTaxUiError } from '@/app/_features/income-tax/errors/create-income-tax-ui-error'

interface IncomeTaxResultProps {
  result: number | null
  error: IncomeTaxUiError | null
  isPending: boolean
}

export function IncomeTaxResult(props: IncomeTaxResultProps) {
  const { result, error, isPending } = props

  if (isPending) {
    return (
      <div
        className="mt-4 rounded-md border p-3"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">Calculating income tax.</span>
        <Skeleton className="h-4 w-28" role="status" />
        <Skeleton className="mt-2 h-8 w-40" role="status" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="mt-4 rounded-md border border-destructive/40 p-3"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    )
  }

  if (result === null) {
    return null
  }

  return (
    <div
      className="mt-4 rounded-md border p-3"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-sm text-muted-foreground">Total income tax</p>
      <p className="text-2xl font-semibold">${result.toFixed(2)}</p>
    </div>
  )
}
