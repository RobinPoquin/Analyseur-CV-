import { type FormEvent, useState } from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    // Récupère les modules du store (auth, fichiers, IA, stockage)
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false); // état global du process
    const [statusText, setStatusText] = useState('') // message affiché à l'utilisateur
    const [file, setFile] = useState<File | null>(null) // fichier sélectionné

    // Récupère le fichier depuis le composant enfant
    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    //Processus d'analyse du CV
    const handleAnalyze = async (
            { companyName, jobTitle, jobDescription, file }
            : { companyName: string, jobTitle: string, jobDescription: string; file: File}
        ) => {        setIsProcessing(true);

        // Étape 1 : upload du PDF
        setStatusText('Importation en cours...');
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return setStatusText("Erreur: Erreur lors de l'import du PDF...") // Si échec → stop process

        // Étape 2 : conversion PDF → image (nécessaire pour l'IA)
        setStatusText('Convertion en image en cours...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) return setStatusText(`Echec: ${imageFile.error}`)

        // Étape 3 : upload de l'image
        setStatusText("Import de l'image");
        const uploadedImage = await fs.upload([imageFile.file])
        if (!uploadedImage) return setStatusText("Erreur: Erreur lors de l'import de l'image...")

        // Étape 4 : préparation des données
        setStatusText('Préparation des données...');
        const uuid = generateUUID(); // identifiant unique pour le CV

        const data = {
            id: uuid,
            resumePath: uploadedFile.path, // chemin du PDF
            imagePath: uploadedImage.path, // chemin de l'image
            companyName, jobTitle, jobDescription,
            feedback: '', // sera rempli après analyse
        }
        // Sauvegarde initiale (sans feedback)
        await kv.set(`resume:${ uuid }`, JSON.stringify(data));

        // Étape 5 : appel IA pour analyser le CV
        setStatusText('Analyse en cours...');

        const feedback = await ai.feedback(
            uploadedFile.path, // fichier à analyser
            prepareInstructions({ jobTitle, jobDescription}) // prompt IA
        )
        if (!feedback) return setStatusText("Erreur : Echec lors de l'analyse du CV");

        // Le retour peut être string OU tableau
        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        // Conversion JSON → objet exploitable
        data.feedback = JSON.parse(feedbackText);
        // Mise à jour avec le feedback final
        await kv.set(`resume:${ uuid }`, JSON.stringify(data));
        setStatusText('Analyse terminé ! Redirection...');
        console.log(data)

        //Redirection vers la page de feedback
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // empêche le rechargement de la page

        // Récupère le formulaire courant (sécurité si event vient d'un enfant)
        const form = e.currentTarget.closest('form');
        if (!form) return;

        // Permet d'extraire facilement les valeurs des inputs
        const formData = new FormData(form);

        // Récupération des champs via leur "name"
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file})
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Amélioration continue de votre CV</h1>

                    {isProcessing ? (
                        <>
                            {/* Affichage dynamique pendant le traitement */}
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full"/>
                        </>
                    ) : (
                        <h2>Ajoutez votre CV pour une note et des conseils d'amélioration</h2>
                    )}

                    {!isProcessing && (
                        // Le formulaire est masqué pendant le traitement
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">

                            <div className="form-div">
                                <label htmlFor="company-name">Entreprise</label>
                                <input type="text" name="company-name" id="company-name" />
                                {/* name = clé utilisée par FormData */}
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-title">Nom du Poste</label>
                                <input type="text" name="job-title" id="job-title" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-description">Description du poste</label>
                                <textarea rows={5} name="job-description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Importer CV</label>

                                {/* Composant externe → remonte le fichier via callback */}
                                <FileUploader onFileSelect={handleFileSelect}/>
                            </div>

                            <button className="primary-button" type="submit">
                                Analyser CV
                            </button>
                        </form>
                    )}

                </div>
            </section>
        </main>
    )
}

export default Upload