import { Users, FileText, CheckCircle, Shield } from "lucide-react";
import { StatsCard } from "./AdminSharedComponents";

interface AdminStatsProps {
    stats: {
        users: number;
        reports: number;
        storyReports: number;
        citizenReports: number;
        organizations: number;
    };
}

export const AdminStatsTab = ({ stats }: AdminStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
                title="Usuarios Totales"
                value={stats.users}
                icon={Users}
                color="text-blue-600"
                bg="bg-blue-600/10"
                desc="Registrados en la plataforma"
            />
            <StatsCard
                title="Reportes de Animales"
                value={stats.reports}
                icon={FileText}
                color="text-rose-600"
                bg="bg-rose-600/10"
                desc="Pendientes de revisión"
            />
            <StatsCard
                title="Reportes de Historias"
                value={stats.storyReports}
                icon={CheckCircle}
                color="text-green-600"
                bg="bg-green-600/10"
                desc="Historias con denuncias"
            />
            <StatsCard
                title="S.O.S Ciudadano"
                value={stats.citizenReports}
                icon={Shield}
                color="text-amber-600"
                bg="bg-amber-600/10"
                desc="Avisos de maltrato/emergencia"
            />
        </div>
    );
};
