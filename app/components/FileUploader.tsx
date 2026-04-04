import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void; // callback pour remonter le fichier au parent
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null); // fichier sélectionné localement

    // useCallback → évite de recréer la fonction à chaque render (optimisation)
    const onDrop = useCallback((acceptedFile: File[]) => {
        const file = acceptedFile[0] || null; // prend uniquement le premier fichier
        setFile(file); // met à jour le state local
        onFileSelect?.(file); // envoie le fichier au parent si callback défini
    }, [onFileSelect])

    const maxFileSize = 20 * 1024 * 1024; // limite à 20MB

    // Hook react-dropzone → gère drag & drop + validation
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false, // un seul fichier
        accept: { 'application/pdf': ['.pdf'] }, // uniquement PDF
        maxSize: maxFileSize, // limite taille
    })

    return (
        <div className="w-full gradient-border">
            {/* getRootProps → transforme la div en zone de drop cliquable */}
            <div {...getRootProps()}>
                {/* input caché géré par dropzone */}
                <input {...getInputProps()} />

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        // Affichage si fichier sélectionné
                        <div
                            className="uploader-selected-file"
                            onClick={(e) => e.stopPropagation()} // empêche d'ouvrir le file picker en cliquant dedans
                        >
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />

                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)} {/* format lisible (KB/MB) */}
                                    </p>
                                </div>
                            </div>

                            <button
                                className="p-2 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation(); // empêche d'ouvrir l'uploader en cliquant sur la croix
                                    setFile(null); // reset local
                                    onFileSelect?.(null); // informe le parent que le fichier est supprimé
                                }}
                            >
                                <img src="/icons/cross.svg" alt="supprimer" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        // Affichage par défaut (aucun fichier)
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className="size-20" />
                            </div>

                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    Cliquez pour importer
                                </span> ou glisser collez
                            </p>

                            <p className="text-lg text-gray-500">
                                PDF (max {formatSize(maxFileSize)})
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader