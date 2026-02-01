import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Eye, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [storyReports, setStoryReports] = useState<StoryReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedStoryReport, setSelectedStoryReport] = useState<StoryReport | null>(null);
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
      await Promise.all([loadReports(), loadStoryReports()]);
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
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive",
      });
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

      setStoryReports(reportsWithReporters as any);
    } catch (error) {
      console.error("Error loading story reports:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes de historias",
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
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-500">Pendiente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-500">Aprobado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-500">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingReports = reports.filter(r => r.status === "pending");
  const pendingStoryReports = storyReports.filter(r => r.status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/20 p-3 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground text-lg">Gestión de reportes y moderación</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-3xl font-bold">{pendingReports.length}</div>
                  <div className="text-sm text-muted-foreground">Reportes Pendientes</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-3xl font-bold">{pendingStoryReports.length}</div>
                  <div className="text-sm text-muted-foreground">Historias Pendientes</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold">{reports.filter(r => r.status === "approved").length}</div>
                  <div className="text-sm text-muted-foreground">Aprobados</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <div className="text-3xl font-bold">{reports.filter(r => r.status === "rejected").length}</div>
                  <div className="text-sm text-muted-foreground">Rechazados</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Tabs */}
          <Tabs defaultValue="animals" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="animals">
                Reportes de Animales ({reports.length})
              </TabsTrigger>
              <TabsTrigger value="stories">
                Reportes de Historias ({storyReports.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="animals">
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg">No hay reportes de animales</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {report.animal && (
                            <img
                              src={report.animal.image_url}
                              alt={report.animal.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold">
                                  {report.animal?.name || "Animal eliminado"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {report.animal?.type === "perro" ? "🐕 Perro" : "🐈 Gato"}
                                </p>
                              </div>
                              {getStatusBadge(report.status)}
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-semibold">Reportado por:</span>{" "}
                                {report.reporter?.full_name || report.reporter?.email || "Usuario desconocido"}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Razón:</span> {report.reason}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(report.created_at).toLocaleDateString("es-AR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            {report.status === "pending" && (
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedReport(report)}
                                  variant="outline"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalles
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stories">
              {storyReports.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg">No hay reportes de historias</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {storyReports.map((report) => (
                    <Card key={report.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {report.story && (
                            <img
                              src={report.story.story_image_url}
                              alt={report.story.animal_name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold">
                                  {report.story?.animal_name || "Historia eliminada"}
                                </h3>
                              </div>
                              {getStatusBadge(report.status)}
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-semibold">Reportado por:</span>{" "}
                                {report.reporter?.full_name || report.reporter?.email || "Usuario desconocido"}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Razón:</span> {report.reason}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(report.created_at).toLocaleDateString("es-AR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            {report.status === "pending" && (
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedStoryReport(report)}
                                  variant="outline"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalles
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Animal Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Reporte</DialogTitle>
            <DialogDescription>Revisa la información y toma una decisión</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {selectedReport.animal && (
                <div>
                  <img
                    src={selectedReport.animal.image_url}
                    alt={selectedReport.animal.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-2xl font-bold mb-2">{selectedReport.animal.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedReport.animal.type === "perro" ? "🐕 Perro" : "🐈 Gato"}
                  </p>
                </div>
              )}
              <Separator />
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Reportado por:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.reporter?.full_name || selectedReport.reporter?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Razón del reporte:</p>
                  <p className="text-sm">{selectedReport.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Fecha:</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedReport.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Button
                  onClick={() => deleteContent(selectedReport, false)}
                  disabled={processing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {processing ? "Procesando..." : "Eliminar Contenido"}
                </Button>
                <Button
                  onClick={() => updateReportStatus(selectedReport.id, "rejected", false)}
                  disabled={processing}
                  variant="outline"
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {processing ? "Procesando..." : "Rechazar Reporte"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Story Report Detail Modal */}
      <Dialog open={!!selectedStoryReport} onOpenChange={() => setSelectedStoryReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Reporte de Historia</DialogTitle>
            <DialogDescription>Revisa la información y toma una decisión</DialogDescription>
          </DialogHeader>
          {selectedStoryReport && (
            <div className="space-y-6">
              {selectedStoryReport.story && (
                <div>
                  <img
                    src={selectedStoryReport.story.story_image_url}
                    alt={selectedStoryReport.story.animal_name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-2xl font-bold mb-2">{selectedStoryReport.story.animal_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStoryReport.story.story_text}</p>
                </div>
              )}
              <Separator />
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Reportado por:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStoryReport.reporter?.full_name || selectedStoryReport.reporter?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Razón del reporte:</p>
                  <p className="text-sm">{selectedStoryReport.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Fecha:</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedStoryReport.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Button
                  onClick={() => deleteContent(selectedStoryReport, true)}
                  disabled={processing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {processing ? "Procesando..." : "Eliminar Historia"}
                </Button>
                <Button
                  onClick={() => updateReportStatus(selectedStoryReport.id, "rejected", true)}
                  disabled={processing}
                  variant="outline"
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {processing ? "Procesando..." : "Rechazar Reporte"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;