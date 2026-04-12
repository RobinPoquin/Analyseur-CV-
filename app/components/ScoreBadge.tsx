import React from 'react'

interface ScoreBadgeProps {
    score: number; // score utilisé pour déterminer le badge
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
    let badgeColor = ''; // classes CSS dynamiques
    let badgeText = ''; // texte affiché

    // Détermine couleur + texte selon le score
    if (score > 70 ) {
        badgeColor = 'bg-badge-green text-green-600';
        badgeText = 'Très bon';
    } else if (score > 49 ) {
        badgeColor = 'bg-badge-yellow text-yellow-600';
        badgeText = 'Bon début'
    } else {
        badgeColor = 'bg-badge-red text-red-600';
        badgeText = "Besoin d'amélioration";
    }

    return (
        // Injection dynamique des classes selon le score
        <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
            <p className="text-sm font-medium">{badgeText}</p>
        </div>
    )
}

export default ScoreBadge