'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/infra/shadcn/components/ui/button'

type IncomeTaxResultErrorBoundaryProps = {
  children: ReactNode
}

type IncomeTaxResultErrorBoundaryState = {
  hasError: boolean
}

function IncomeTaxResultErrorFallback(props: { onRetry: () => void }) {
  const { onRetry } = props

  return (
    <div className="mt-4 rounded-md border border-destructive/40 p-3">
      <p className="text-sm text-destructive">
        Something went wrong while rendering the tax result.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-3"
        onClick={onRetry}
      >
        Retry
      </Button>
      {/* TODO: Hook this retry button to re-trigger the latest action submission. */}
    </div>
  )
}

export class IncomeTaxResultErrorBoundary extends Component<
  IncomeTaxResultErrorBoundaryProps,
  IncomeTaxResultErrorBoundaryState
> {
  constructor(props: IncomeTaxResultErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): IncomeTaxResultErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <IncomeTaxResultErrorFallback onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}
