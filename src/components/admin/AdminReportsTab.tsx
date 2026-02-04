import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState, ReportItem, StoryReportItem } from "./AdminSharedComponents";
import { Report, StoryReport } from "./AdminTypes";

interface AdminReportsTabProps {
    reports: Report[];
    storyReports: StoryReport[];
    getStatusBadge: (status: string) => React.ReactNode;
    onViewReport: (report: Report) => void;
    onViewStoryReport: (report: StoryReport) => void;
}

export const AdminReportsTab = ({
    reports,
    storyReports,
    getStatusBadge,
    onViewReport,
    onViewStoryReport
}: AdminReportsTabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Animales Reportados</h3>
                    <span className="bg-rose-500/10 text-rose-500 text-xs font-bold px-2 py-1 rounded-full border border-rose-500/20">
                        {reports.length} pendientes
                    </span>
                </div>
                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                        {reports.length === 0 ? (
                            <EmptyState msg="No hay reportes de animales pendientes" />
                        ) : (
                            reports.map((report) => (
                                <ReportItem
                                    key={report.id}
                                    report={report}
                                    onView={onViewReport}
                                    badge={getStatusBadge(report.status)}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Historias Reportadas</h3>
                    <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded-full border border-green-500/20">
                        {storyReports.length} historias
                    </span>
                </div>
                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                        {storyReports.length === 0 ? (
                            <EmptyState msg="No hay historias reportadas" />
                        ) : (
                            storyReports.map((report) => (
                                <StoryReportItem
                                    key={report.id}
                                    report={report}
                                    onView={onViewStoryReport}
                                    badge={getStatusBadge(report.status)}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
