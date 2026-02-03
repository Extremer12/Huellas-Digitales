import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Eye, Shield, Loader2, Home, Activity, Users, FileText, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// ... interfaces same as before ... 
interface Report {
  id: string;
  animal_id: string;
  reporter_user_id: string;
  reason: string;
  status: string;
  created_at: string;
  animal?: {
    name: string;
    type: string;
    image_url: string;
    user_id: string;
  };
  reporter?: {
    email: string;
    full_name: string | null;
  };
}

interface StoryReport {
  id: string;
  story_id: string;
  reporter_user_id: string;
  reason: string;
  status: string;
  created_at: string;
  story?: {
    animal_name: string;
    story_text: string;
    story_image_url: string;
    adopter_user_id: string;
  };
  reporter?: {
    email: string;
    full_name: string | null;
  };
}
interface CitizenReport {
  id: string;
  type: string;
  status: string;
  severity: string;
  description: string;
  location_lat: number;
  location_lng: number;
  images: string[];
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  verified: boolean;
  email: string;
  phone: string;
  logo_url: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [storyReports, setStoryReports] = useState<StoryReport[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
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

      // Check if user has admin or moderator role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdminAccess = roles?.some(r => r.role === "admin" || r.role === "moderator");

      if (!hasAdminAccess) {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos para acceder a esta página",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await Promise.all([
        loadReports(),
        loadStoryReports(),
        loadCitizenReports(),
        loadOrganizations()
      ]);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          animal:animals(name, type, image_url, user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reporter profiles separately
      const reportsWithReporters = await Promise.all(
        (data || []).map(async (report) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", report.reporter_user_id)
            .maybeSingle();

          return {
            ...report,
            reporter: profile
          };
        })
      );

      setReports(reportsWithReporters as any);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const loadStoryReports = async () => {
    try {
      const { data, error } = await supabase
        .from("story_reports")
        .select(`
          *,
          story:adoption_stories(animal_name, story_text, story_image_url, adopter_user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reportsWithReporters = await Promise.all(
        (data || []).map(async (report) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", report.reporter_user_id)
            .maybeSingle();

          return {
            ...report,
            reporter: profile
          };
        })
      );

      setStoryReports(reportsWithReporters as any);
    } catch (error) {
      console.error("Error loading story reports:", error);
    }
  };
  const loadCitizenReports = async () => {
    try {
      const { data, error } = await supabase
        .from("citizen_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCitizenReports(data || []);
    } catch (error) {
      console.error("Error loading citizen reports:", error);
    }
  };

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error("Error loading organizations:", error);
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

      toast({
        title: "Éxito",
        description: "Estado del reporte actualizado",
      });
      await loadCitizenReports();
      setSelectedCitizenReport(null);
    } catch (error) {
      console.error("Error updating citizen report:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
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

      toast({
        title: "Éxito",
        description: `Organización ${!currentStatus ? "verificada" : "desmarcada"}`,
      });
      await loadOrganizations();
    } catch (error) {
      console.error("Error toggling verification:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la verificación",
        variant: "destructive",
      });
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

      toast({
        title: "Éxito",
        description: `Reporte ${status === "approved" ? "aprobado" : "rechazado"} correctamente`,
      });

      if (isStoryReport) {
        await loadStoryReports();
        setSelectedStoryReport(null);
      } else {
        await loadReports();
        setSelectedReport(null);
      }
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el reporte",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const deleteContent = async (report: Report | StoryReport, isStoryReport: boolean = false) => {
    setProcessing(true);
    try {
      if (isStoryReport) {
        const storyReport = report as StoryReport;
        const { error } = await supabase
          .from("adoption_stories")
          .delete()
          .eq("id", storyReport.story_id);

        if (error) throw error;

        await updateReportStatus(report.id, "approved", true);
      } else {
        const animalReport = report as Report;
        const { error } = await supabase
          .from("animals")
          .delete()
          .eq("id", animalReport.animal_id);

        if (error) throw error;

        await updateReportStatus(report.id, "approved", false);
      }

      toast({
        title: "Contenido Eliminado",
        description: "El contenido reportado ha sido eliminado",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contenido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/50">Pendiente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/50">Aprobado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/50">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Dashboard calculations
  const totalPending = reports.filter(r => r.status === "pending").length +
    storyReports.filter(r => r.status === "pending").length +
    citizenReports.filter(r => r.status === "pending").length;

  const totalOrgs = organizations.length;
  const verifiedOrgs = organizations.filter(o => o.verified).length;
  const totalCitizen = citizenReports.length;

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <Header />

      <div className="pt-24 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
        {/* Intro */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Panel de Control
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido, Administrador. Aquí tienes el pulso de la plataforma.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">v2.1.0 Stable</Badge>
            <Badge className="px-3 py-1 bg-green-500 hover:bg-green-600">Sistema Operativo</Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pendientes"
            value={totalPending}
            icon={AlertTriangle}
            color="text-orange-500"
            bg="bg-orange-500/10"
            desc="Requieren atención"
          />
          <StatsCard
            title="Reportes Civiles"
            value={totalCitizen}
            icon={FileText}
            color="text-blue-500"
            bg="bg-blue-500/10"
            desc="Totales registrados"
          />
          <StatsCard
            title="Organizaciones"
            value={totalOrgs}
            icon={Home}
            color="text-purple-500"
            bg="bg-purple-500/10"
            desc={`${verifiedOrgs} verificadas`}
          />
          <StatsCard
            title="Monitoreo"
            value="Activo"
            icon={Activity}
            color="text-green-500"
            bg="bg-green-500/10"
            desc="Todo funcionando"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-background/95 backdrop-blur-sm border shadow-sm p-1 h-12 rounded-xl">
              <TabsTrigger value="reports" className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Reportes ({reports.length + storyReports.length})</TabsTrigger>
              <TabsTrigger value="citizen" className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Civiles ({citizenReports.length})</TabsTrigger>
              <TabsTrigger value="orgs" className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Organizaciones ({organizations.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="reports" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Animal Reports */}
              <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Reportes de Mascotas</CardTitle>
                </CardHeader>
                <ScrollArea className="h-[500px]">
                  <div className="p-4 space-y-4">
                    {reports.length === 0 && <EmptyState msg="No hay reportes de animales." />}
                    {reports.map((report) => (
                      <ReportItem
                        key={report.id}
                        report={report}
                        onView={() => setSelectedReport(report)}
                        badge={getStatusBadge(report.status)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Story Reports */}
              <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg flex items-center gap-2"><Ban className="w-5 h-5 text-destructive" /> Reportes de Historias</CardTitle>
                </CardHeader>
                <ScrollArea className="h-[500px]">
                  <div className="p-4 space-y-4">
                    {storyReports.length === 0 && <EmptyState msg="No hay reportes de historias." />}
                    {storyReports.map((report) => (
                      <StoryReportItem
                        key={report.id}
                        report={report}
                        onView={() => setSelectedStoryReport(report)}
                        badge={getStatusBadge(report.status)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="citizen" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Reportes Ciudadanos</CardTitle>
                <CardDescription>Alertas enviadas por la comunidad, ordenadas por urgencia.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {citizenReports.length === 0 && <div className="col-span-full"><EmptyState msg="No hay reportes ciudadanos." /></div>}
                  {citizenReports.map((report) => (
                    <CitizenReportCard
                      key={report.id}
                      report={report}
                      onView={() => setSelectedCitizenReport(report)}
                      badge={getStatusBadge(report.status)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orgs" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Directorio de Organizaciones</CardTitle>
                <CardDescription>Gestión de refugios y entidades verificadas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizations.map((org) => (
                    <OrgCard
                      key={org.id}
                      org={org}
                      onToggleVerify={() => toggleOrganizationVerification(org.id, org.verified)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* --- MODALS --- */}

        {/* Citizen Report Modal */}
        <Dialog open={!!selectedCitizenReport} onOpenChange={() => setSelectedCitizenReport(null)}>
          <DialogContent className="max-w-2xl rounded-[2rem]">
            {selectedCitizenReport && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Reporte #{(selectedCitizenReport.id.substring(0, 6))}</span>
                    <Badge variant={selectedCitizenReport.severity === 'urgent' ? 'destructive' : 'default'} className="uppercase px-3">
                      {selectedCitizenReport.type}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl">
                  {selectedCitizenReport.images?.map((img, i) => (
                    <img key={i} src={img} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
                  ))}
                </div>

                <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">Descripción</h4>
                  <p className="text-foreground leading-relaxed">{selectedCitizenReport.description}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => updateCitizenReportStatus(selectedCitizenReport.id, 'investigating')}
                    disabled={selectedCitizenReport.status === 'investigating' || processing}
                  >
                    En Investigación
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateCitizenReportStatus(selectedCitizenReport.id, 'resolved')}
                    disabled={selectedCitizenReport.status === 'resolved' || processing}
                  >
                    Resuelto
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Animal/Story Report Modal (Generic Logic reused) */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-md rounded-[2rem]">
            {selectedReport && (
              <div className="space-y-6">
                <div className="relative h-48 rounded-xl overflow-hidden">
                  {selectedReport.animal && <img src={selectedReport.animal.image_url} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold text-xl">{selectedReport.animal?.name}</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <InfoRow label="Razón" value={selectedReport.reason} />
                  <InfoRow label="Reportado por" value={selectedReport.reporter?.full_name || selectedReport.reporter?.email || "Anónimo"} />
                  <InfoRow label="Fecha" value={new Date(selectedReport.created_at).toLocaleDateString()} />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => updateReportStatus(selectedReport.id, "rejected", false)} disabled={processing}>Desestimar</Button>
                  <Button variant="destructive" onClick={() => deleteContent(selectedReport, false)} disabled={processing}>Eliminar Post</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Story Report Modal (Similar to above) */}
        <Dialog open={!!selectedStoryReport} onOpenChange={() => setSelectedStoryReport(null)}>
          <DialogContent className="max-w-md rounded-[2rem]">
            {selectedStoryReport && (
              <div className="space-y-6">
                <div className="relative h-48 rounded-xl overflow-hidden">
                  {selectedStoryReport.story && <img src={selectedStoryReport.story.story_image_url} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold text-xl">{selectedStoryReport.story?.animal_name}</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <InfoRow label="Razón" value={selectedStoryReport.reason} />
                  <InfoRow label="Reportado por" value={selectedStoryReport.reporter?.full_name || selectedStoryReport.reporter?.email || "Anónimo"} />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => updateReportStatus(selectedStoryReport.id, "rejected", true)} disabled={processing}>Desestimar</Button>
                  <Button variant="destructive" onClick={() => deleteContent(selectedStoryReport, true)} disabled={processing}>Eliminar Historia</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const StatsCard = ({ title, value, icon: Icon, color, bg, desc }: any) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {/* <Badge variant="outline" className={`${color} bg-transparent border-current opacity-50`}>+2.5%</Badge> */}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-black">{value}</h3>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/50 mt-1">{desc}</p>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <CheckCircle className="w-8 h-8" />
    </div>
    <p>{msg}</p>
  </div>
);

const ReportItem = ({ report, onView, badge }: any) => (
  <div className="flex items-center justify-between p-4 bg-background rounded-xl border hover:border-primary/50 transition-colors group">
    <div className="flex items-center gap-4">
      <img src={report.animal?.image_url || "/placeholder.svg"} className="w-12 h-12 rounded-full object-cover border" />
      <div>
        <h4 className="font-bold text-sm">{report.animal?.name || "Desconocido"}</h4>
        <div className="flex items-center gap-2 mt-1">
          {badge}
          <span className="text-xs text-muted-foreground truncate max-w-[150px]">{report.reason}</span>
        </div>
      </div>
    </div>
    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={onView}>
      <Eye className="w-4 h-4" />
    </Button>
  </div>
);

const StoryReportItem = ({ report, onView, badge }: any) => (
  <div className="flex items-center justify-between p-4 bg-background rounded-xl border hover:border-primary/50 transition-colors group">
    <div className="flex items-center gap-4">
      <img src={report.story?.story_image_url || "/placeholder.svg"} className="w-12 h-12 rounded-full object-cover border" />
      <div>
        <h4 className="font-bold text-sm">{report.story?.animal_name || "Desconocido"}</h4>
        <div className="flex items-center gap-2 mt-1">
          {badge}
          <span className="text-xs text-muted-foreground truncate max-w-[150px]">{report.reason}</span>
        </div>
      </div>
    </div>
    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={onView}>
      <Eye className="w-4 h-4" />
    </Button>
  </div>
);

const CitizenReportCard = ({ report, onView, badge }: any) => (
  <div className="p-4 bg-card rounded-xl border hover:border-primary/50 transition-all flex flex-col justify-between h-full">
    <div>
      <div className="flex justify-between items-start mb-2">
        <Badge variant={report.severity === 'urgent' ? 'destructive' : 'secondary'}>{report.type}</Badge>
        {badge}
      </div>
      <p className="text-sm line-clamp-3 text-muted-foreground my-3">{report.description}</p>
    </div>
    <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
      <span>{new Date(report.created_at).toLocaleDateString()}</span>
      <Button size="sm" variant="ghost" className="h-6" onClick={onView}>Ver</Button>
    </div>
  </div>
);

const OrgCard = ({ org, onToggleVerify }: any) => (
  <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
      {org.logo_url ? <img src={org.logo_url} className="w-full h-full object-cover" /> : <Home className="w-6 h-6 opacity-50" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="font-bold truncate">{org.name}</h4>
        {org.verified && <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500/20" />}
      </div>
      <p className="text-xs text-muted-foreground truncate">{org.email}</p>
    </div>
    <Button size="icon" variant={org.verified ? "default" : "outline"} onClick={onToggleVerify} className={org.verified ? "bg-blue-600 hover:bg-blue-700" : ""}>
      {org.verified ? <CheckCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
    </Button>
  </div>
);

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div>
    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">{label}</span>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default Admin;