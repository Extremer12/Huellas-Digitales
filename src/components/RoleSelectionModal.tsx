import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Building2, Stethoscope, Heart } from "lucide-react";
import OrgRequestModal from "./OrgRequestModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RoleSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectUser: () => void;
}

const RoleSelectionModal = ({ open, onOpenChange, onSelectUser }: RoleSelectionModalProps) => {
    const navigate = useNavigate();
    const [showOrgForm, setShowOrgForm] = useState(false);

    if (showOrgForm) {
        return (
            <OrgRequestModal
                open={open}
                onOpenChange={(val) => {
                    if (!val) setShowOrgForm(false);
                    onOpenChange(val);
                }}
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
                <div className="bg-gradient-to-br from-primary/10 via-background to-background p-10">
                    <DialogHeader className="mb-8 text-center">
                        <DialogTitle className="text-4xl font-black tracking-tighter">¿Cómo quieres participar?</DialogTitle>
                        <DialogDescription className="text-lg font-medium text-muted-foreground">
                            Elige tu rol en la comunidad de Huellas Digitales.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* User Option */}
                        <button
                            onClick={onSelectUser}
                            className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-card border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group text-center"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <User className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Soy Persona</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Quiero adoptar, reportar una mascota o ayudar de forma independiente.
                                </p>
                            </div>
                        </button>

                        {/* Professional Option */}
                        <button
                            onClick={() => setShowOrgForm(true)}
                            className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-card border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group text-center"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <Building2 className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Soy Organización</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Tengo una veterinaria, refugio o fundación y quiero verficarme.
                                </p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-primary/5 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Heart className="w-4 h-4 text-primary" />
                        <span>Unidos por el bienestar animal</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RoleSelectionModal;
