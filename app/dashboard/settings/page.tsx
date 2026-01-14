import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappApiConfig } from "@/components/whatsapp/api-config";
import { WhatsappQrConnection } from "@/components/whatsapp/qr-connection";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <div className="flex items-center space-x-2">
                    {/* Add buttons if needed */}
                </div>
            </div>
            <Separator />
            <Tabs defaultValue="whatsapp" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="whatsapp">Integração WhatsApp</TabsTrigger>
                    <TabsTrigger value="profile">Perfil (Demo)</TabsTrigger>
                    <TabsTrigger value="billing">Faturamento (Demo)</TabsTrigger>
                </TabsList>
                <TabsContent value="whatsapp" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4">
                            <WhatsappQrConnection />
                        </div>
                        <div className="col-span-3">
                            <WhatsappApiConfig />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="profile">
                    <div className="p-4 border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">Configurações de perfil indisponíveis no modo de demonstração.</p>
                    </div>
                </TabsContent>
                <TabsContent value="billing">
                    <div className="p-4 border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">Configurações de faturamento indisponíveis no modo de demonstração.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
