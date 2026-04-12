import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {

    // Détermine la couleur du score selon sa valeur
    const textColor = score > 70 ? 'text-green-600'
        : score > 49
            ? 'text-yellow-600'
            : 'text-red-600';

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-2xl">{title}</p>

                    {/* Badge visuel du score */}
                    <ScoreBadge score={score} />
                </div>

                <p className="text-2xl">
                    {/* Couleur dynamique selon la qualité du score */}
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

// Composant principal : affiche le résumé global du feedback IA
const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md w-full">

            <div className="flex flex-row items-center p-4 gap-8">

                {/* Score global affiché sous forme de jauge */}
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Votre note de CV</h2>
                    <p className="text-sm text-gray-500">
                        Ce score est calculé en fonction des variables suivantes
                    </p>
                </div>
            </div>

            {/* Détail des scores par catégorie */}
            <Category title="Ton et Style" score={feedback.toneAndStyle.score} />
            <Category title="Contenu" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Competences" score={feedback.skills.score} />
        </div>
    )
}

export default Summary