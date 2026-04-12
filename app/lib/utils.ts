import {twMerge} from "tailwind-merge";
import {type ClassValue, clsx} from "clsx";

// Utilitaire pour gérer les classes CSS dynamiques proprement
// - clsx : permet de combiner des classes conditionnelles (string, array, object)
// - twMerge : résout les conflits Tailwind (ex: "px-2 px-4" → garde seulement "px-4")
export function cn(...inputs: ClassValue[]){
    return twMerge(clsx(inputs))
}

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