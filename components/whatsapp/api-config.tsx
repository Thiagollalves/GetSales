"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Key, Phone } from "lucide-react";

export function WhatsappApiConfig() {
    const [token, setToken] = useState("");
    const [phoneId, setPhoneId] = useState("");
    const [verifyToken, setVerifyToken] = useState("");

    useEffect(() => {
        const storedToken = localStorage.getItem("wh_access_token");
        const storedPhoneId = localStorage.getItem("wh_phone_id");
        const storedVerify = localStorage.getItem("wh_verify_token");
        if (storedToken) setToken(storedToken);
        if (storedPhoneId) setPhoneId(storedPhoneId);
        if (storedVerify) setVerifyToken(storedVerify);
    }, []);

    const handleSave = () => {
        localStorage.setItem("wh_access_token", token);
        localStorage.setItem("wh_phone_id", phoneId);
        localStorage.setItem("wh_verify_token", verifyToken || "conecta-crm-demo");
        toast.success("Credenciais da API salvas com sucesso!");
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Oficial do WhatsApp (Cloud API)
                </CardTitle>
                <CardDescription>
                    Configure suas credenciais do Meta for Developers para enviar mensagens.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="phone-id">Phone Number ID</Label>
                    <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="phone-id"
                            placeholder="Ex: 100609346..."
                            value={phoneId}
                            onChange={(e) => setPhoneId(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="token">Access Token (Permanent or Temporary)</Label>
                    <Input
                        id="token"
                        type="password"
                        placeholder="EAAG..."
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="verify">Webhook Verify Token</Label>
                    <Input
                        id="verify"
                        placeholder="conecta-crm-demo"
                        value={verifyToken}
                        onChange={(e) => setVerifyToken(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                </Button>
            </CardFooter>
        </Card>
    );
}
