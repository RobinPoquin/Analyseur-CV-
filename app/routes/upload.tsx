import { type FormEvent, useState } from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";

const Upload = () => {
    const [isProcessing, setIsProcessing] = useState(false); // indique si l'analyse est en cours
    const [statusText, setStatusText] = useState('') // texte affiché pendant le traitement
    const [file, setFile] = useState<File | null>(null) // fichier sélectionné

    // Récupère le fichier depuis le composant enfant
    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // empêche le rechargement de la page

        // Récupère le formulaire courant (sécurité si event vient d'un enfant)
        const form = e.currentTarget.closest('form');
        if (!form) return;

        // Permet d'extraire facilement les valeurs des inputs
        const formData = new FormData(form);

        // Récupération des champs via leur "name"
        const companyName = formData.get('company-name');
        const jobTile = formData.get('job-title');
        const jobDescription = formData.get('job-description');

        // Debug : vérifie les données récupérées + fichier
        console.log({
            companyName,
            jobTile,
            jobDescription,
            file
        });
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
                                <label htmlFor="job-title">Poste Occupé</label>
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