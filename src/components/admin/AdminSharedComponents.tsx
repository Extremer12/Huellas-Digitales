import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, MapPin, Eye, FileText, MoreHorizontal } from "lucide-react";
import { Organization, Report, StoryReport, CitizenReport } from "./AdminTypes";

export const StatsCard = ({ title, value, icon: Icon, color, bg, desc }: any) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold">{value}</span>
                </div>
                {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
            </div>
        </CardContent>
    </Card>
);

export const EmptyState = ({ msg }: { msg: string }) => (
    <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/50">
        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">{msg}</p>
    </div>
);

export const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <div>
        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">{label}</span>
        <p className="text-sm font-medium">{value}</p>
    </div>
);

export const ReportItem = ({ report, onView, badge }: { report: Report, onView: (r: Report) => void, badge: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-sm group">
        <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
                <img
                    src={report.animal?.image_url || "/placeholder.svg"}
                    className="w-12 h-12 rounded-xl object-cover"
                    alt={report.animal?.name}
                />
                <div className="absolute -top-1 -right-1">
                    {badge}
                </div>
            </div>
            <div className="min-w-0">
                <h4 className="font-bold truncate">{report.animal?.name || "Carga eliminada"}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground" />
                    Razón: {report.reason}
                </p>
            </div>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onView(report)}>
            <Eye className="w-4 h-4" />
        </Button>
    </div>
);

export const StoryReportItem = ({ report, onView, badge }: { report: StoryReport, onView: (r: StoryReport) => void, badge: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
                <img
                    src={report.story?.story_image_url || "/placeholder.svg"}
                    className="w-12 h-12 rounded-xl object-cover"
                    alt={report.story?.animal_name}
                />
                <div className="absolute -top-1 -right-1">
                    {badge}
                </div>
            </div>
            <div className="min-w-0">
                <h4 className="font-bold truncate">Historia: {report.story?.animal_name}</h4>
                <p className="text-xs text-muted-foreground">Reportada por: {report.reporter?.email}</p>
            </div>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => onView(report)}>
            <Eye className="w-4 h-4" />
        </Button>
    </div>
);

export const CitizenReportCard = ({ report, onView, badge }: { report: CitizenReport, onView: (r: CitizenReport) => void, badge: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <h4 className="font-bold truncate">{report.type}</h4>
                <div className="flex items-center gap-2">
                    {badge}
                    <span className="text-xs text-muted-foreground line-clamp-1">{report.description}</span>
                </div>
            </div>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full" onClick={() => onView(report)}>
            <Eye className="w-4 h-4" />
        </Button>
    </div>
);

export const OrgCard = ({ org, onToggleVerify }: { org: Organization, onToggleVerify: () => void }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                <img src={org.logo_url || "/placeholder.svg"} className="w-full h-full object-cover" alt={org.name} />
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold truncate">{org.name}</h4>
                    {org.verified && <CheckCircle className="w-3 h-3 text-blue-500 fill-current" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{org.email}</p>
            </div>
        </div>
        <Button size="icon" variant={org.verified ? "default" : "outline"} onClick={onToggleVerify} className={org.verified ? "bg-blue-600 hover:bg-blue-700" : ""}>
            {org.verified ? <CheckCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
        </Button>
    </div>
);
