import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // You could send error to logging service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-app-card border border-app-border rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-app-text mb-2">
                            Algo salió mal
                        </h1>

                        <p className="text-app-muted mb-6">
                            La aplicación encontró un error inesperado. Por favor, intenta recargar la página.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-app-muted hover:text-app-text mb-2">
                                    Detalles del error
                                </summary>
                                <div className="bg-app-bg border border-app-border rounded-lg p-4 text-xs font-mono overflow-auto max-h-48">
                                    <p className="text-red-500 mb-2">{this.state.error.toString()}</p>
                                    <pre className="text-app-muted whitespace-pre-wrap">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="bg-app-accent hover:bg-app-accentHover text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Recargar Aplicación
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
