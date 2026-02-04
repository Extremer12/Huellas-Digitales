import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLog } from "./AdminTypes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, User, Info, Calendar } from "lucide-react";
import { EmptyState } from "./AdminSharedComponents";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const AdminAuditLogsTab = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const { data, error } = await supabase
                .from("admin_logs")
                .select(`
                    *,
                    admin:profiles!admin_logs_admin_id_fkey(full_name, email)
                `)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;
            setLogs(data as any);
        } catch (error) {
            console.error("Error loading logs:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Registro de Auditoría</h3>
                        <p className="text-sm text-muted-foreground">Últimas acciones administrativas registradas</p>
                    </div>
                </div>
                <Badge variant="outline" className="h-7">
                    {logs.length} acciones
                </Badge>
            </div>

            <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <EmptyState msg="No hay registros de auditoría aún" />
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="p-5 bg-card rounded-[2rem] border border-border/50 hover:border-primary/20 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                                                {log.action}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(log.created_at), "PPP p", { locale: es })}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-bold">Admin: </span>
                                            <span className="text-sm text-foreground/80">
                                                {log.admin?.full_name || log.admin?.email || "Admin desconocido"}
                                            </span>
                                        </div>

                                        {log.details && (
                                            <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border/30">
                                                <div className="flex items-start gap-2">
                                                    <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                                                    <div className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Target ID</div>
                                        <div className="text-[10px] font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground truncate max-w-[120px]">
                                            {log.target_id || "Global"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
