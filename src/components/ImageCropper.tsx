import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ZoomIn, RotateCcw, Check, X } from 'lucide-react';
import { getCroppedImg } from '@/utils/cropImage'; // Helper function we need to create

interface ImageCropperProps {
    imageSrc: string | null;
    open: boolean;
    onClose: () => void;
    onCropComplete: (croppedImage: Blob) => void;
    aspectRatio?: number; // Default 1 (Square) or 4/5 (Portrait)
}

const ImageCropper = ({ imageSrc, open, onClose, onCropComplete, aspectRatio = 4 / 5 }: ImageCropperProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setLoading(true);
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!imageSrc) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none text-white h-[90vh] sm:h-auto flex flex-col">
                <DialogHeader className="p-4 bg-black/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
                    <DialogTitle className="text-center text-white font-medium">Editar Imagen</DialogTitle>
                </DialogHeader>

                <div className="relative flex-1 min-h-[400px] w-full bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                        showGrid={true}
                    />
                </div>

                <div className="p-6 bg-background text-foreground space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomIn className="w-5 h-5 text-muted-foreground" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="flex-1"
                        />
                    </div>

                    <DialogFooter className="flex-row gap-2 justify-between sm:justify-end">
                        <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                            <X className="w-4 h-4 mr-2" /> Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none">
                            {loading ? "Procesando..." : <><Check className="w-4 h-4 mr-2" /> Usar Foto</>}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropper;
