"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCopy, Link2 } from "lucide-react";
import { toast } from "sonner";

export function WhatsappWebhookConfig() {
  const [origin, setOrigin] = useState("");
  const [verifyToken, setVerifyToken] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    setVerifyToken(localStorage.getItem("wh_verify_token") ?? "conecta-crm-demo");
  }, []);

  const webhookUrl = origin ? `${origin}/api/whatsapp/webhook` : "";

  const handleCopy = async () => {
    if (!webhookUrl) return;
    await navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook copiado!");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Webhook Oficial (Meta)
        </CardTitle>
        <CardDescription>
          Use este endpoint para receber mensagens da Cloud API e acionar automações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL do Webhook</Label>
          <div className="flex gap-2">
            <Input id="webhook-url" readOnly value={webhookUrl} placeholder="https://sua-url.com/api/whatsapp/webhook" />
            <Button type="button" variant="outline" onClick={handleCopy} disabled={!webhookUrl}>
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Verify Token</Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{verifyToken}</Badge>
            <span className="text-xs text-muted-foreground">Configure em META_VERIFY_TOKEN.</span>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Variáveis recomendadas</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>META_WHATSAPP_TOKEN, META_PHONE_NUMBER_ID, META_VERIFY_TOKEN</li>
            <li>N8N_WEBHOOK_URL (para automações)</li>
            <li>SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
