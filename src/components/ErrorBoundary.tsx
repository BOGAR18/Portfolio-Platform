import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

// Menangkap error render React agar seluruh halaman tidak blank
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">Something went wrong.</h1>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500"
        >
          Reload
        </button>
      </div>
    );
  }
}