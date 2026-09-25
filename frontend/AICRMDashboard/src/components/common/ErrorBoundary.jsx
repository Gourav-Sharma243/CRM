import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shadow-sm border border-rose-100">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-ink">Something went wrong</h2>
          <p className="mt-2 text-sm text-ink-soft max-w-md">
            An unexpected error occurred. Please try reloading the page or return to the dashboard.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={this.handleReload} variant="primary">
              <RefreshCw className="h-4 w-4 mr-2" /> Reload page
            </Button>
            <Button onClick={this.handleGoHome} variant="outline">
              <Home className="h-4 w-4 mr-2" /> Go to Dashboard
            </Button>
          </div>

          {process.env.NODE_ENV !== "production" && this.state.error && (
            <details className="mt-6 max-w-lg text-left text-xs text-rose-800 bg-rose-50 p-4 rounded-xl border border-rose-200 overflow-auto">
              <summary className="font-semibold cursor-pointer">Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
