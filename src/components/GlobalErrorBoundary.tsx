
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // Here you would log to a service like Sentry
    }

    private handleReset = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center animate-in fade-in zoom-in duration-500">
                    <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20 mb-6">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500" />
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                        ¡Ups! Algo salió mal
                    </h1>

                    <p className="text-foreground/80 max-w-md mb-8 text-lg">
                        No te preocupes, hasta las mejores mascotas tienen un mal día.
                        Hemos notificado al equipo técnico.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={this.handleReset} size="lg" className="font-semibold shadow-lg hover:scale-105 transition-transform">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Intentar de nuevo
                        </Button>

                        <Button variant="outline" size="lg" onClick={() => window.location.href = '/'} className="font-semibold">
                            <Home className="mr-2 h-4 w-4" />
                            Ir al Inicio
                        </Button>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="mt-8 p-4 bg-muted rounded-lg text-left max-w-2xl overflow-auto text-xs font-mono border border-border">
                            <p className="font-bold text-red-500 mb-2">{this.state.error.toString()}</p>
                            <pre>{this.state.error.stack}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
