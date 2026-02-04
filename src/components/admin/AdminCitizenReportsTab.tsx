import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState, CitizenReportCard } from "./AdminSharedComponents";
import { CitizenReport } from "./AdminTypes";

interface AdminCitizenReportsTabProps {
    citizenReports: CitizenReport[];
    getStatusBadge: (status: string) => React.ReactNode;
    onViewCitizenReport: (report: CitizenReport) => void;
}

export const AdminCitizenReportsTab = ({
    citizenReports,
    getStatusBadge,
    onViewCitizenReport
}: AdminCitizenReportsTabProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Reportes Ciudadanos S.O.S</h3>
                <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-1 rounded-full border border-amber-500/20">
                    {citizenReports.length} avisos
                </span>
            </div>
            <ScrollArea className="h-[600px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {citizenReports.length === 0 ? (
                        <div className="col-span-full">
                            <EmptyState msg="No hay reportes ciudadanos pendientes" />
                        </div>
                    ) : (
                        citizenReports.map((report) => (
                            <CitizenReportCard
                                key={report.id}
                                report={report}
                                onView={onViewCitizenReport}
                                badge={getStatusBadge(report.status)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
