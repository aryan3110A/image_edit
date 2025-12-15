'use client';

import { useRef, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Upload, Image, FileText, Film, Folder } from 'lucide-react';

export function UploadPanel() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploads, setUploads] = useState<string[]>([]);
    const addImageElement = useCanvasStore((state) => state.addImageElement);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target?.result as string;
                    setUploads((prev) => [...prev, dataUrl]);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleAddImage = (src: string) => {
        addImageElement(src, {
            transform: {
                x: 100,
                y: 100,
                width: 200,
                height: 200,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                originX: 'center',
                originY: 'center',
            },
        });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-white font-semibold">Uploads</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors mb-6"
                >
                    <Upload className="text-gray-400 mb-2" size={32} />
                    <p className="text-gray-300 text-sm font-medium">Upload files</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, SVG, PDF</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.svg"
                        multiple
                        onChange={handleFileSelect}
                    />
                </div>

                {/* Upload Categories */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <button className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-gray-300 text-sm">
                        <Image size={16} />
                        Images
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-gray-300 text-sm">
                        <Film size={16} />
                        Videos
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-gray-300 text-sm">
                        <FileText size={16} />
                        Documents
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-gray-300 text-sm">
                        <Folder size={16} />
                        Folders
                    </button>
                </div>

                {/* Uploaded Files */}
                {uploads.length > 0 && (
                    <div>
                        <h3 className="text-gray-300 text-sm font-medium mb-3">Your Uploads</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {uploads.map((src, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleAddImage(src)}
                                    className="aspect-square bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                >
                                    <img
                                        src={src}
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {uploads.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                        No uploads yet
                    </div>
                )}
            </div>
        </div>
    );
}
