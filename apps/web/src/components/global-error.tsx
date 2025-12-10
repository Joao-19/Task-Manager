import { useRouter } from '@tanstack/react-router';
import { Button } from './ui/buttons/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/cards/card';

export function GlobalErrorComponent({ error, reset }: { error: any; reset: () => void }) {
    const router = useRouter();

    const handleReset = () => {
        // Tenta resetar o router state e recarregar a rota
        router.invalidate();
        reset();
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-destructive/20">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">
                        Ops! Algo deu errado
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-slate-600">
                        Encontramos um erro inesperado ao tentar exibir esta página.
                        Nossa equipe foi notificada.
                    </p>

                    {/* Show technical details only in development */}
                    {import.meta.env.DEV && (
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md text-left text-xs overflow-auto max-h-48 font-mono">
                            <p className="font-bold mb-2 text-red-400">DEV ERROR DETAILS:</p>
                            {error instanceof Error ? error.message : JSON.stringify(error)}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2 justify-center pt-2">
                    <Button variant="default" onClick={handleReset} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Tentar Novamente
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
                        <Home className="h-4 w-4" />
                        Ir para Início
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
