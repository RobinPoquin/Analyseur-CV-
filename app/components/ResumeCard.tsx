import React from 'react'
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";

// Destructuring des props : on récupère directement les champs de "resume"
const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    return (
        // Route dynamique : chaque carte redirige vers son CV grâce à l'id
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">

            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    <h2 className="!text-black font-bold break-words">{companyName}</h2>
                    <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>
                </div>

                <div className="flex-shrink-0">
                    {/* Accès à une donnée imbriquée*/}
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>

            <div className="gradient-border animate-in fade-in duration-1000">
                <div className="w-full h-full">
                    <img
                        // Image dynamique venant des données
                        src={imagePath}
                        alt="CV"
                        className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                    />
                </div>
            </div>
        </Link>
    )
}

export default ResumeCard