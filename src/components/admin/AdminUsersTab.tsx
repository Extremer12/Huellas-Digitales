import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Users,
    Search,
    UserPlus,
    ShieldCheck,
    ShieldAlert,
    MoreVertical,
    Trash2,
    Mail
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AdminUser } from "./AdminTypes";
import { format } from "date-fns";

export const AdminUsersTab = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);

            // 1. Fetch all profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email, full_name, avatar_url, created_at');

            if (profilesError) throw profilesError;

            // 2. Fetch all user roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id, role');

            if (rolesError) throw rolesError;

            // 3. Merge data
            const roleMap = new Map((rolesData || []).map(r => [r.user_id, r.role]));

            const formattedUsers: AdminUser[] = (profilesData || []).map(u => ({
                id: u.id,
                email: u.email,
                full_name: u.full_name,
                avatar_url: u.avatar_url,
                created_at: u.created_at,
                role: roleMap.get(u.id) || 'user'
            }));

            setUsers(formattedUsers);
        } catch (error: any) {
            toast({
                title: "Error cargando usuarios",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .upsert({ user_id: userId, role: newRole as any }, { onConflict: 'user_id' });

            if (error) throw error;

            toast({ title: "Rol actualizado", description: `Usuario ahora es ${newRole}` });
            loadUsers();
        } catch (error: any) {
            toast({
                title: "Error al actualizar rol",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        className="pl-10 rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl font-medium">
                        {users.length} Usuarios Totales
                    </Badge>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Registro</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    Cargando comunidad...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                <AvatarImage src={user.avatar_url || ""} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {user.full_name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[14px] leading-tight text-foreground/90">
                                                    {user.full_name || "Sin nombre"}
                                                </span>
                                                <span className="text-[12px] text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                user.role === 'admin'
                                                    ? "bg-primary text-primary-foreground"
                                                    : user.role === 'moderator'
                                                        ? "bg-amber-500 text-white"
                                                        : "bg-muted text-muted-foreground"
                                            }
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[13px]">
                                        {format(new Date(user.created_at), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl w-48 shadow-lg">
                                                <DropdownMenuLabel>Gestionar Usuario</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => updateUserRole(user.id, 'admin')}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                                    Hacer Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => updateUserRole(user.id, 'moderator')}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                                    Hacer Moderador
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => updateUserRole(user.id, 'user')}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    Hacer Usuario
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer opacity-50 pointer-events-none">
                                                    <Trash2 className="h-4 w-4" />
                                                    Suspender Cuenta
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
