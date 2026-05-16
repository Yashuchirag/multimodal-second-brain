import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackLabel?: string
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
    return { hasError: true, message }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">
              {this.props.fallbackLabel ?? 'Something went wrong'}
            </p>
            <p className="text-xs text-muted mt-1 max-w-sm">{this.state.message}</p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                       bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15
                       text-secondary hover:text-primary transition-all duration-150"
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
