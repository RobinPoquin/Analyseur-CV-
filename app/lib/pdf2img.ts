// Résultat retourné après conversion du PDF
export interface PdfConversionResult {
    imageUrl: string; // URL temporaire pour affichage
    file: File | null; // fichier image généré
    error?: string;
}

// Variables globales pour éviter de recharger pdf.js plusieurs fois
let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

// Charge dynamiquement pdf.js
async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib; // déjà chargé → on retourne direct
    if (loadPromise) return loadPromise; // en cours de chargement → on attend

    isLoading = true;

    // Import dynamique pour éviter de charger la lib au démarrage
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // Configure le worker pdf.js
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        pdfjsLib = lib;
        isLoading = false;

        return lib;
    });

    return loadPromise;
}

// Fonction principale : convertit la première page d'un PDF en image
export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs(); // charge pdf.js si nécessaire

        // Lecture du fichier en mémoire
        const arrayBuffer = await file.arrayBuffer();

        // Charge le document PDF
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

        // Récupère uniquement la première page
        const page = await pdf.getPage(1);

        // Augmente le scale → améliore la qualité de l'image
        const viewport = page.getViewport({ scale: 4 });

        // Création d'un canvas pour dessiner la page
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Amélioration du rendu (anti-aliasing)
        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        // Render de la page PDF dans le canvas
        await page.render({ canvasContext: context!, viewport }).promise;

        // Conversion du canvas en image
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Garde le nom du fichier original (remplace .pdf par .png)
                        const originalName = file.name.replace(/\.pdf$/i, "");

                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob), // URL utilisable dans <img>
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Échec de la création du blob image",
                        });
                    }
                },
                "image/png",
                1.0 // qualité maximale
            );
        });
    } catch (err) {
        // Gestion globale des erreurs
        return {
            imageUrl: "",
            file: null,
            error: `Échec de la conversion du PDF : ${err}`,
        };
    }
}