import React from 'react'

interface Suggestion {
    type: "good" | "improve"; // type de conseil (positif ou amélioration)
    tip: string; // texte du conseil
}

interface ATSProps {
    score: number; // score ATS global
    suggestions: Suggestion[]; // liste des recommandations
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {

    // Détermine le dégradé de fond selon le score
    const gradientClass = score > 69
        ? 'from-green-100'
        : score > 49
            ? 'from-yellow-100'
            : 'from-red-100';

    // Choisit l’icône en fonction du niveau du score
    const iconSrc = score > 69
        ? '/icons/ats-good.svg'
        : score > 49
            ? '/icons/ats-warning.svg'
            : '/icons/ats-bad.svg';

    // Texte affiché sous le score
    const subtitle = score > 69
        ? 'Bon travail!'
        : score > 49
            ? 'Bon début'
            : 'Besoin d\'amélioration';

    return (
        <div className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full p-6`}>

            {/* Section header : icône + score */}
            <div className="flex items-center gap-4 mb-6">
                <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
                <div>
                    <h2 className="text-2xl font-bold">ATS Score - {score}/100</h2>
                </div>
            </div>

            {/* Description + recommandations */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>

                {/* Explication du score ATS */}
                <p className="text-gray-600 mb-4">
                    Ce score indique dans quelle mesure votre CV est susceptible d'être bien classé dans les systèmes de gestion des candidatures utilisés par les employeurs.
                </p>

                {/* Liste des suggestions */}
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <img
                                // Icône différente selon type de conseil
                                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                                alt={suggestion.type === "good" ? "Check" : "Warning"}
                                className="w-5 h-5 mt-1"
                            />
                            <p className={suggestion.type === "good" ? "text-green-700" : "text-amber-700"}>
                                {suggestion.tip}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message de fin */}
            <p className="text-gray-700 italic">
                Continuez à peaufiner votre CV afin d'augmenter vos chances de passer les filtres ATS et d'attirer l'attention des recruteurs.
            </p>
        </div>
    )
}

export default ATS