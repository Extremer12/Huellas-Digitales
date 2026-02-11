import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Shield,
  FileText,
  AlertTriangle,
  Loader2,
  Users,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Modular Components
import { Report, StoryReport, CitizenReport, Organization, OrganizationRequest } from "@/components/admin/AdminTypes";
import { AdminStatsTab } from "@/components/admin/AdminStatsTab";
import { AdminReportsTab } from "@/components/admin/AdminReportsTab";
import { AdminOrganizationsTab } from "@/components/admin/AdminOrganizationsTab";
import { AdminCitizenReportsTab } from "@/components/admin/AdminCitizenReportsTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminAuditLogsTab } from "@/components/admin/AdminAuditLogsTab";
import { InfoRow } from "@/components/admin/AdminSharedComponents";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    reports: 0,
    storyReports: 0,
    citizenReports: 0,
    organizations: 0
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [storyReports, setStoryReports] = useState<StoryReport[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgRequests, setOrgRequests] = useState<OrganizationRequest[]>([]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedStoryReport, setSelectedStoryReport] = useState<StoryReport | null>(null);
  const [selectedCitizenReport, setSelectedCitizenReport] = useState<CitizenReport | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!userRole) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador.",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      loadStats();
      loadReports();
      loadStoryReports();
      loadCitizenReports();
      loadOrganizations();
      loadOrgRequests();
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
    const { count: reportsCount } = await supabase.from("reports").select("*", { count: 'exact', head: true }).eq("status", "pending");
    const { count: storyReportsCount } = await supabase.from("story_reports").select("*", { count: 'exact', head: true }).eq("status", "pending");
    const { count: citizenReportsCount } = await supabase.from("citizen_reports").select("*", { count: 'exact', head: true }).eq("status", "pending");
    const { count: orgsCount } = await supabase.from("organizations").select("*", { count: 'exact', head: true });

    setStats({
      users: usersCount || 0,
      reports: reportsCount || 0,
      storyReports: storyReportsCount || 0,
      citizenReports: citizenReportsCount || 0,
      organizations: orgsCount || 0
    });
  };

  const loadReports = async () => {
    try {
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;

      // Enrich with animal and reporter info manually to avoid join errors (400)
      const enrichedReports = await Promise.all(
        (reportsData || []).map(async (report) => {
          const { data: animal } = await supabase
            .from("animals")
            .select("name, type, image_url, user_id")
            .eq("id", report.animal_id)
            .single();

          const { data: reporter } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", report.reporter_user_id)
            .single();

          return {
            ...report,
            animal,
            reporter
          };
        })
      );

      setReports(enrichedReports as any);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const loadStoryReports = async () => {
    try {
      const { data: storyReportsData, error: storyReportsError } = await supabase
        .from("story_reports")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (storyReportsError) throw storyReportsError;

      const enrichedStoryReports = await Promise.all(
        (storyReportsData || []).map(async (report) => {
          const { data: story } = await supabase
            .from("adoption_stories")
            .select("animal_name, story_text, story_image_url, adopter_user_id")
            .eq("id", report.story_id)
            .single();

          const { data: reporter } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", report.reporter_user_id)
            .single();

          return {
            ...report,
            story,
            reporter
          };
        })
      );

      setStoryReports(enrichedStoryReports as any);
    } catch (error) {
      console.error("Error loading story reports:", error);
    }
  };

  const loadCitizenReports = async () => {
    const { data, error } = await supabase
      .from("citizen_reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error) setCitizenReports(data as any);
  };

  const loadOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrganizations(data as any);
  };

  const loadOrgRequests = async () => {
    const { data, error } = await (supabase as any)
      .from("organization_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error) setOrgRequests(data);
  };

  const handleApproveRequest = async (request: OrganizationRequest) => {
    setProcessing(true);
    try {
      // 1. Insert into organizations
      const { error: insertError } = await supabase
        .from("organizations")
        .insert({
          name: request.name,
          type: request.type,
          address: request.address,
          phone: request.contact_info,
          location_lat: request.location_lat,
          location_lng: request.location_lng,
          verified: true,
          email: "pendiente@email.com" // Placeholder or ask for it
        });

      if (insertError) throw insertError;

      // 2. Update request status
      const { error: updateError } = await (supabase as any)
        .from("organization_requests")
        .update({ status: "approved" })
        .eq("id", request.id);

      if (updateError) throw updateError;

      toast({ title: "Organización aprobada y agregada" });
      loadOrgRequests();
      loadOrganizations();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessing(true);
    try {
      const { error } = await (supabase as any)
        .from("organization_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;
      toast({ title: "Solicitud rechazada" });
      loadOrgRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const updateCitizenReportStatus = async (reportId: string, status: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("citizen_reports")
        .update({ status })
        .eq("id", reportId);

      if (error) throw error;
      toast({ title: "Reporte actualizado" });
      loadCitizenReports();
      loadStats();
      setSelectedCitizenReport(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const toggleOrganizationVerification = async (orgId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ verified: !currentStatus })
        .eq("id", orgId);

      if (error) throw error;
      toast({ title: currentStatus ? "Verificación removida" : "Organización verificada" });
      loadOrganizations();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateReportStatus = async (reportId: string, status: string, isStoryReport: boolean = false) => {
    setProcessing(true);
    try {
      const table = isStoryReport ? "story_reports" : "reports";
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq("id", reportId);

      if (error) throw error;
      toast({ title: "Reporte actualizado" });
      if (isStoryReport) loadStoryReports(); else loadReports();
      loadStats();
      if (isStoryReport) setSelectedStoryReport(null); else setSelectedReport(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const deleteContent = async (report: Report | StoryReport, isStoryReport: boolean = false) => {
    setProcessing(true);
    try {
      if (isStoryReport) {
        const sr = report as StoryReport;
        await supabase.from("adoption_stories").delete().eq("id", sr.story_id);
      } else {
        const r = report as Report;
        await supabase.from("animals").delete().eq("id", r.animal_id);
      }
      await updateReportStatus(report.id, "resolved", isStoryReport);
      toast({ title: "Contenido eliminado permanentemente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="destructive" className="animate-pulse">Pendiente</Badge>;
      case "resolved": return <Badge variant="default" className="bg-green-500">Resuelto</Badge>;
      case "rejected": return <Badge variant="secondary">Rechazado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Shield className="w-10 h-10 text-primary" />
              Panel de Control
            </h1>
            <p className="text-muted-foreground mt-1">Supervisión global y gestión de la comunidad</p>
          </div>
        </div>

        <AdminStatsTab stats={stats} />

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-card border p-1 rounded-2xl h-14 w-full md:w-auto overflow-x-auto justify-start md:justify-center">
            <TabsTrigger value="reports" className="rounded-xl px-6 h-11 data-[state=active]:bg-primary data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Moderación
            </TabsTrigger>
            <TabsTrigger value="sos" className="rounded-xl px-6 h-11 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reportes S.O.S
            </TabsTrigger>
            <TabsTrigger value="orgs" className="rounded-xl px-6 h-11 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Organizaciones
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-6 h-11 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-xl px-6 h-11 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Auditoría
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AdminReportsTab
              reports={reports}
              storyReports={storyReports}
              getStatusBadge={getStatusBadge}
              onViewReport={(r) => setSelectedReport(r)}
              onViewStoryReport={(sr) => setSelectedStoryReport(sr)}
            />
          </TabsContent>

          <TabsContent value="sos" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AdminCitizenReportsTab
              citizenReports={citizenReports}
              getStatusBadge={getStatusBadge}
              onViewCitizenReport={(r) => setSelectedCitizenReport(r)}
            />
          </TabsContent>

          <TabsContent value="orgs" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AdminOrganizationsTab
              organizations={organizations}
              orgRequests={orgRequests}
              onToggleVerification={toggleOrganizationVerification}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
            />
          </TabsContent>

          <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AdminAuditLogsTab />
          </TabsContent>
        </Tabs>

        {/* Modals check... */}
        {selectedReport && (
          <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
            <DialogContent className="sm:max-w-md rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>Detalle del Reporte</DialogTitle>
                <DialogDescription>
                  Información detallada sobre el reporte del animal seleccionado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="aspect-video rounded-3xl overflow-hidden bg-muted">
                  <img src={selectedReport.animal?.image_url} alt="Evidencia" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4">
                  <InfoRow label="Razón" value={selectedReport.reason} />
                  <InfoRow label="Reportado por" value={selectedReport.reporter?.full_name || selectedReport.reporter?.email || "Anónimo"} />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => updateReportStatus(selectedReport!.id, "rejected")} disabled={processing}>Desestimar</Button>
                  <Button variant="destructive" onClick={() => deleteContent(selectedReport!)} disabled={processing}>Eliminar Animal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Story Report Modal */}
        {selectedStoryReport && (
          <Dialog open={!!selectedStoryReport} onOpenChange={() => setSelectedStoryReport(null)}>
            <DialogContent className="sm:max-w-md rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>Denuncia de Historia</DialogTitle>
                <DialogDescription>
                  Revisión de contenido reportado en historias de adopción.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="aspect-video rounded-3xl overflow-hidden bg-muted">
                  <img src={selectedStoryReport.story?.story_image_url} alt="Evidencia" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4">
                  <InfoRow label="Razón" value={selectedStoryReport.reason} />
                  <InfoRow label="Reportado por" value={selectedStoryReport.reporter?.full_name || selectedStoryReport.reporter?.email || "Anónimo"} />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => updateReportStatus(selectedStoryReport!.id, "rejected", true)} disabled={processing}>Desestimar</Button>
                  <Button variant="destructive" onClick={() => deleteContent(selectedStoryReport!, true)} disabled={processing}>Eliminar Historia</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Citizen Report Modal */}
        {selectedCitizenReport && (
          <Dialog open={!!selectedCitizenReport} onOpenChange={() => setSelectedCitizenReport(null)}>
            <DialogContent className="sm:max-w-lg rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>S.O.S: {selectedCitizenReport.type}</DialogTitle>
                <DialogDescription>
                  Reporte ciudadano sobre una emergencia animal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-2">
                  {selectedCitizenReport.images?.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-muted">
                      <img src={img} alt="Evidencia S.O.S" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <InfoRow label="Gravedad" value={selectedCitizenReport.severity} />
                  <InfoRow label="Descripción" value={selectedCitizenReport.description} />
                </div>
                <Separator />
                <div className="flex gap-3">
                  <Button onClick={() => updateCitizenReportStatus(selectedCitizenReport!.id, "resolved")} className="flex-1 bg-green-600 hover:bg-green-700">Resolver</Button>
                  <Button onClick={() => updateCitizenReportStatus(selectedCitizenReport!.id, "rejected")} variant="outline" className="flex-1">Ignorar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

// --- STYLES & EXPORT ---

export default Admin;