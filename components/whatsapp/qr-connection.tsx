"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function WhatsappQrConnection() {
    const [status, setStatus] = useState<"disconnected" | "generating" | "ready" | "connected">("disconnected");
    const [qrValue, setQrValue] = useState("");

    const generateQr = () => {
        setStatus("generating");
        // Simulate fetching QR code from backend
        setTimeout(() => {
            setQrValue(`conecta-crm-session-${Math.random().toString(36).substring(7)}`);
            setStatus("ready");
        }, 1500);
    };

    const simulateConnection = () => {
        // Determine if we should auto-connect for demo
        // In a real app, this would be a socket event "connection.update"
        toast.info("Aguardando leitura do QR Code...");
        setTimeout(() => {
            setStatus("connected");
            toast.success("Dispositivo conectado com sucesso!");
        }, 5000);
    };

    useEffect(() => {
        if (status === "ready") {
            simulateConnection();
        }
    }, [status]);

    const handleDisconnect = () => {
        setStatus("disconnected");
        setQrValue("");
        toast.success("Sessão desconectada.");
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Smartphone className="w-5 h-5 md:w-6 md:h-6" />
                    WhatsApp Business Web
                </CardTitle>
                <CardDescription>
                    Conecte sua conta empresarial para usar o CRM como uma extensão do seu WhatsApp.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] space-y-6 p-4 md:p-6">
                {status === "disconnected" && (
                    <div className="text-center space-y-4 w-full max-w-sm">
                        <div className="p-4 bg-muted rounded-full inline-block">
                            <Smartphone className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground px-4">
                            Nenhum dispositivo conectado. Gere o QR Code para parear.
                        </p>
                        <Button onClick={generateQr} className="w-full md:w-auto">Gerar QR Code</Button>
                    </div>
                )}

                {status === "generating" && (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Gerando sessão...</p>
                    </div>
                )}

                {status === "ready" && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <QRCodeSVG value={qrValue} size={200} />
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground text-center max-w-[250px]">
                            Abra o WhatsApp no seu celular &gt; Menu &gt; Aparelhos conectados &gt; Conectar um aparelho
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Aguardando leitura...</span>
                        </div>
                    </div>
                )}

                {status === "connected" && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-5">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-lg">Conectado</h3>
                            <p className="text-sm text-muted-foreground">Sessão ativa e pronta para uso.</p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                            Online
                        </Badge>
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-between border-t pt-4">
                <div className="text-xs text-muted-foreground">
                    Status: <span className="font-medium text-foreground">{status === 'connected' ? 'Online' : 'Offline'}</span>
                </div>
                {status === "connected" && (
                    <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                        Desconectar
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
