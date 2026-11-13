import { Component } from 'react';
import { logger } from '../../lib/logger';

/** Last line of defence: one broken page shows a message instead of a blank screen. */
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    logger.error('Unhandled render error', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-ink-2">Reload the page to continue.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-accent rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          Reload
        </button>
      </main>
    );
  }
}
