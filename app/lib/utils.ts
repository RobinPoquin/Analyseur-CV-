export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'; // cas particulier pour éviter log(0)

    const k = 1024; // base de conversion (1 KB = 1024 bytes)
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; // unités possibles

    // Détermine quelle unité utiliser (KB, MB, etc.)
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Convertit la taille dans la bonne unité + limite à 2 décimales
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Génère un identifiant unique pour identifier chaque CV
export const generateUUID = () => crypto.randomUUID();