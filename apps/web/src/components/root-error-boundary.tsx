import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/buttons/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class RootErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-red-50 p-4 font-sans text-center">
                    <AlertCircle className="h-16 w-16 text-red-600 mb-6" />
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Erro Crítico</h1>
                    <p className="text-slate-600 mb-8 max-w-md">
                        Desculpe, o aplicativo encontrou um erro irrecuperável e precisa ser reiniciado.
                    </p>

                    {import.meta.env.DEV && this.state.error && (
                        <div className="bg-white border border-red-200 p-4 rounded-lg mb-8 max-w-2xl w-full text-left overflow-auto max-h-64 shadow-sm">
                            <p className="font-mono text-xs text-red-600 font-bold mb-1">{this.state.error.name}</p>
                            <p className="font-mono text-sm text-slate-700">{this.state.error.message}</p>
                        </div>
                    )}

                    <Button onClick={this.handleReload} size="lg" className="shadow-xl">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Recarregar Aplicação
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
