import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();

    // Liste des fichiers présents dans le répertoire racine
    const [files, setFiles] = useState<FSItem[]>([]);

    // Lit le contenu du répertoire racine et met à jour l'état
    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    // Charge les fichiers au montage du composant
    useEffect(() => {
        loadFiles();
    }, []);

    // Redirige vers la page d'auth si l'utilisateur n'est pas connecté
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    // Supprime tous les fichiers et vide le stockage clé-valeur
    const handleDelete = async () => {
        // Parcourt chaque fichier et le supprime
        files.forEach(async (file) => {
            await fs.delete(file.path);
        });

        // Vide entièrement le stockage clé-valeur
        await kv.flush();

        // Recharge la liste pour confirmer la suppression
        loadFiles();
    };

    // Affichage pendant le chargement initial
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Affichage en cas d'erreur
    if (error) {
        return <div>Error {error}</div>;
    }

    return (
        <div>
            {/* Affiche le nom de l'utilisateur connecté */}
            Authenticated as: {auth.user?.username}

            <div>Existing files:</div>

            {/* Liste tous les fichiers présents */}
            <div className="flex flex-col gap-4">
                {files.map((file) => (
                    <div key={file.id} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>

            {/* Bouton qui déclenche la suppression de toutes les données */}
            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                >
                    Wipe App Data
                </button>
            </div>
        </div>
    );
};

export default WipeApp;