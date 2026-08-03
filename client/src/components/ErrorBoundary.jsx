import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-red-500">!</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Something went wrong</h2>
            <p className="text-sm text-slate-500 mt-2">
              An unexpected error occurred while rendering this page.
              Please reload to continue.
            </p>
            {import.meta.env?.DEV && this.state.error && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left overflow-auto">
                <p className="text-xs font-mono text-red-600 break-all">{String(this.state.error)}</p>
                {this.state.errorInfo && (
                  <p className="text-xs font-mono text-slate-500 break-all mt-2">{String(this.state.errorInfo.componentStack)}</p>
                )}
              </div>
            )}
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
