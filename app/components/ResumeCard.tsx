import {useEffect, useState} from 'react'
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {usePuterStore} from "~/lib/puter";

// Destructuring des props : on récupère directement les champs de "resume"
const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        const loadResume = async () => {

            // Lit le fichier (image du CV) via son chemin
            const blob = await fs.read(imagePath);

            // Sécurité : si aucun fichier trouvé, on stoppe
            if(!blob) return;

            // Convertit le Blob en URL utilisable et permet d'afficher le fichier directement
            let url = URL.createObjectURL(blob);

            setResumeUrl(url); // met à jour le state pour affichage
        }

        loadResume();
    }, [imagePath]);

    return (
        // Route dynamique : chaque carte redirige vers son CV grâce à l'id
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">

            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="text-black font-bold">CV</h2>}
                </div>

                <div className="flex-shrink-0">
                    {/* Accès à une donnée imbriquée*/}
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>

            {resumeUrl && (
            <div className="gradient-border animate-in fade-in duration-1000">
                <div className="w-full h-full">
                    <img
                        // Image dynamique venant des données
                        src={resumeUrl}
                        alt="CV"
                        className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                    />
                </div>
            </div>
            )}
        </Link>
    )
}

export default ResumeCard