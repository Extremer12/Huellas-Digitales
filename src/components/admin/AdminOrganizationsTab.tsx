import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { EmptyState, OrgCard } from "./AdminSharedComponents";
import { Organization, OrganizationRequest } from "./AdminTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminOrganizationsTabProps {
    organizations: Organization[];
    orgRequests: OrganizationRequest[];
    onToggleVerification: (id: string, current: boolean) => void;
    onApproveRequest: (req: OrganizationRequest) => void;
    onRejectRequest: (id: string) => void;
}

export const AdminOrganizationsTab = ({
    organizations,
    orgRequests,
    onToggleVerification,
    onApproveRequest,
    onRejectRequest
}: AdminOrganizationsTabProps) => {
    return (
        <div className="space-y-8">
            {/* PENDING REQUESTS SECTION */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">Solicitudes Pendientes</h3>
                    {orgRequests.length > 0 && (
                        <Badge variant="destructive" className="animate-pulse">{orgRequests.length} nuevas</Badge>
                    )}
                </div>

                {orgRequests.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground bg-muted/20">
                        No hay solicitudes pendientes.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orgRequests.map((req) => (
                            <Card key={req.id} className="bg-card border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold">{req.name}</h4>
                                            <Badge variant="outline" className="text-[10px] mt-1 capitalize">{req.type}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>📍 {req.address || "Sin dirección"}</p>
                                        <p>📞 {req.contact_info}</p>
                                        <p className="text-[10px] opacity-70">Enviado: {new Date(req.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 h-8" onClick={() => onApproveRequest(req)}>
                                            <Check className="w-3 h-3 mr-1" /> Aprobar
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full hover:bg-destructive/10 hover:text-destructive h-8" onClick={() => onRejectRequest(req.id)}>
                                            <X className="w-3 h-3 mr-1" /> Rechazar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* REGISTERED ORGS SECTION */}
            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Organizaciones Registradas</h3>
                    <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-2 py-1 rounded-full border border-blue-500/20">
                        {organizations.length} registradas
                    </span>
                </div>
                <ScrollArea className="h-[500px] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {organizations.length === 0 ? (
                            <div className="col-span-full">
                                <EmptyState msg="No hay organizaciones registradas" />
                            </div>
                        ) : (
                            organizations.map((org) => (
                                <OrgCard
                                    key={org.id}
                                    org={org}
                                    onToggleVerify={() => onToggleVerification(org.id, org.verified)}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
