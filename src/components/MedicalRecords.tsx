import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MedicalRecord {
    id: string;
    animal_id: string;
    type: 'vaccine' | 'sterilization' | 'checkup' | 'surgery' | 'other';
    date: string;
    description: string;
    vet_name: string;
    next_due_date?: string;
    created_at: string;
}

interface MedicalRecordsProps {
    animalId: string;
    isOwner: boolean;
}

const MedicalRecords = ({ animalId, isOwner }: MedicalRecordsProps) => {
    const { toast } = useToast();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [adding, setAdding] = useState(false);

    const [newRecord, setNewRecord] = useState({
        type: 'checkup' as MedicalRecord['type'],
        date: new Date().toISOString().split('T')[0],
        description: '',
        vet_name: '',
        next_due_date: '',
    });

    useEffect(() => {
        fetchRecords();
    }, [animalId]);

    const fetchRecords = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('medical_records')
                .select('*')
                .eq('animal_id', animalId)
                .order('date', { ascending: false });

            if (error) throw error;
            setRecords(data as MedicalRecord[]);
        } catch (error) {
            console.error('Error fetching medical records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            const { error } = await (supabase as any)
                .from('medical_records')
                .insert({
                    animal_id: animalId,
                    type: newRecord.type,
                    date: newRecord.date,
                    description: newRecord.description,
                    vet_name: newRecord.vet_name,
                    next_due_date: newRecord.next_due_date || null,
                });

            if (error) throw error;

            toast({
                title: "Éxito",
                description: "Historia clínica actualizada",
            });
            setShowForm(false);
            setNewRecord({
                type: 'checkup',
                date: new Date().toISOString().split('T')[0],
                description: '',
                vet_name: '',
                next_due_date: '',
            });
            await fetchRecords();
        } catch (error) {
            console.error('Error adding medical record:', error);
            toast({
                title: "Error",
                description: "No se pudo agregar el registro",
                variant: "destructive",
            });
        } finally {
            setAdding(false);
        }
    };

    const deleteRecord = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;
        try {
            const { error } = await (supabase as any)
                .from('medical_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    if (loading) return <div className="animate-pulse h-20 bg-muted/20 rounded-lg"></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Historia Clínica
                </h3>

                {/* 
                   User requested to remove this button from the Detail View. 
                   "eliminalo eso debe estar solo en el formulario" 
                */}
                {/* {isOwner && (
                    <Button
                        size="sm"
                        variant={showForm ? "ghost" : "outline"}
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-full"
                    >
                        {showForm ? "Cancelar" : (
                            <>
                                <Plus className="w-4 h-4 mr-2" /> Agregar Registro
                            </>
                        )}
                    </Button>
                )} */}
            </div>

            {
                showForm && (
                    <Card className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        <CardContent className="pt-6">
                            <form onSubmit={handleAddRecord} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipo</Label>
                                        <Select
                                            value={newRecord.type}
                                            onValueChange={(v: any) => setNewRecord({ ...newRecord, type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="vaccine">Vacuna</SelectItem>
                                                <SelectItem value="sterilization">Castración</SelectItem>
                                                <SelectItem value="checkup">Control</SelectItem>
                                                <SelectItem value="surgery">Cirugía</SelectItem>
                                                <SelectItem value="other">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fecha</Label>
                                        <Input
                                            type="date"
                                            value={newRecord.date}
                                            onChange={e => setNewRecord({ ...newRecord, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Profesional / Clínica</Label>
                                    <Input
                                        placeholder="Nombre del veterinario"
                                        value={newRecord.vet_name}
                                        onChange={e => setNewRecord({ ...newRecord, vet_name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción / Notas</Label>
                                    <Textarea
                                        placeholder="Detalles del procedimiento..."
                                        value={newRecord.description}
                                        onChange={e => setNewRecord({ ...newRecord, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Próximo Turno (Opcional)</Label>
                                    <Input
                                        type="date"
                                        value={newRecord.next_due_date}
                                        onChange={e => setNewRecord({ ...newRecord, next_due_date: e.target.value })}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={adding}>
                                    {adding ? "Guardando..." : "Guardar Registro"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )
            }

            <div className="space-y-3">
                {records.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-[2rem] border border-dashed border-white/10">
                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>No hay registros médicos cargados todavía.</p>
                    </div>
                ) : (
                    records.map((record) => (
                        <div
                            key={record.id}
                            className="p-4 rounded-2xl bg-card/30 border border-white/5 flex gap-4 items-start group hover:bg-card/50 transition-colors"
                        >
                            <div className={`p-3 rounded-xl ${record.type === 'vaccine' ? 'bg-blue-500/10 text-blue-500' :
                                record.type === 'sterilization' ? 'bg-purple-500/10 text-purple-500' :
                                    'bg-primary/10 text-primary'
                                }`}>
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold capitalize">{
                                        record.type === 'vaccine' ? 'Vacunación' :
                                            record.type === 'sterilization' ? 'Castración/Esterilización' :
                                                record.type === 'checkup' ? 'Control Médico' :
                                                    record.type === 'surgery' ? 'Cirugía' : 'Otro'
                                    }</h4>
                                    <span className="text-[10px] font-medium opacity-50">{record.date}</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{record.description}</p>
                                {record.vet_name && (
                                    <p className="text-[10px] mt-2 font-medium text-primary">🩺 {record.vet_name}</p>
                                )}
                                {record.next_due_date && (
                                    <Badge variant="outline" className="mt-3 text-[10px] border-primary/20 text-primary">
                                        🔔 Próximo: {record.next_due_date}
                                    </Badge>
                                )}
                            </div>
                            {isOwner && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteRecord(record.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MedicalRecords;
