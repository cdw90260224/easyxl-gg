import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="p-6 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">화면 렌더링 중 오류가 발생했습니다</h2>
          <p className="text-sm text-red-700 dark:text-red-300 max-w-md">
            데이터 구조가 올바르지 않거나 예상치 못한 값이 포함되어 있습니다. 새로고침하거나 다른 쿼리를 시도해주세요.
          </p>
          {this.state.error && (
            <pre className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg text-xs font-mono text-red-800 dark:text-red-200 text-left overflow-auto max-w-full">
              {this.state.error.message}
            </pre>
          )}
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
