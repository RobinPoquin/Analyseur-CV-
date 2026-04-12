import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

// Métadonnées de la page (titre + description)
export const meta = () => ([
    { title: 'Resumind | Résumé '},
    { name: 'description', content: 'Résumé détaillé de votre CV'},
])

const Resume = () => {
    const { id } = useParams(); // récupère l'id depuis l'URL
    const { auth, isLoading, fs, kv } = usePuterStore();

    const [imageUrl, setImageUrl] = useState(''); // URL de l'image du CV
    const [resumeUrl, setResumeUrl] = useState(''); // URL du PDF
    const [feedback, setFeedback] = useState<Feedback | null>(null); // résultat de l'analyse IA

    const navigate = useNavigate();

    // Redirige vers login si utilisateur non authentifié
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [isLoading]);

    // Charge les données du CV depuis le KV store
    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if (!resume) return;

            const data = JSON.parse(resume); // parse les données stockées

            // Récupère le PDF depuis le storage
            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;

            // Recrée un fichier PDF exploitable dans le navigateur
            const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            // Récupère l'image générée du CV
            const imageBlob = await fs.read(data.imagePath);
            if (!imageBlob) return;

            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            // Stocke le feedback IA
            setFeedback(data.feedback);

            console.log({ resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src='/icons/back.svg' alt='logo' className='w-2.5 h-2.5' />
                    <span className="text-gray-800 text-sm font-semibold">
                        Retour à l'accueil
                    </span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">

                {/* Section gauche : aperçu du CV */}
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">

                            {/* Lien → ouvre le PDF complet */}
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl} // image preview du CV
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>

                {/* Section droite : analyse */}
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Analyse du CV</h2>

                    {feedback ? (
                        // Affiche les résultats quand disponibles
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        // Loader pendant l'analyse
                        <img src="/images/resume-scan-2.gif" className="w-full"/>
                    )}
                </section>

            </div>
        </main>
    )
}

export default Resume