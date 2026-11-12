import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error in itinerary app:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f1e8] text-[#242824] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#fffdf8] border border-[#d9d3c8] p-8 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#fbf0f0] border border-[#bc553b] text-[#bc553b] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="font-serif-tc text-xl font-bold mb-2">
              行程手帳載入時遇到問題
            </h2>

            <p className="font-sans-tc text-xs text-[#777a74] mb-4 leading-relaxed">
              瀏覽器中的舊快取資料格式可能與最新版本不符。點擊下方按鈕即可清除本機快取並還原預設的青森行程。
            </p>

            {this.state.error && (
              <div className="bg-[#f5f1e8] border border-[#d9d3c8] p-3 text-[11px] font-mono text-left text-[#bc553b] mb-5 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                type="button"
                className="w-full py-2.5 px-4 bg-[#bc553b] hover:bg-[#a64730] text-white font-serif-tc text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>清除快取並重新載入行程</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                type="button"
                className="w-full py-2 px-4 bg-white border border-[#d9d3c8] hover:text-[#bc553b] font-serif-tc text-xs transition-colors"
              >
                重試重新載入
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
