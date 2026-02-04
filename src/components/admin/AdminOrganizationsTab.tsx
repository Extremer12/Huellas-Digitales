import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState, OrgCard } from "./AdminSharedComponents";
import { Organization } from "./AdminTypes";

interface AdminOrganizationsTabProps {
    organizations: Organization[];
    onToggleVerification: (id: string, current: boolean) => void;
}

export const AdminOrganizationsTab = ({ organizations, onToggleVerification }: AdminOrganizationsTabProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Organizaciones y Refugios</h3>
                <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-2 py-1 rounded-full border border-blue-500/20">
                    {organizations.length} registradas
                </span>
            </div>
            <ScrollArea className="h-[600px] pr-4">
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
    );
};
