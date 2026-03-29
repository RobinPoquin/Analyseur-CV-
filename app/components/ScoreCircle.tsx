const ScoreCircle = ({ score = 75 }: { score: number }) => {
    const radius = 40;
    const stroke = 8;

    // Rayon réel du cercle en tenant compte de l'épaisseur du trait
    const normalizedRadius = radius - stroke / 2;

    // Calcul de la circonférence du cercle (formule 2πr)
    const circumference = 2 * Math.PI * normalizedRadius;

    // Conversion du score (0-100) en pourcentage (0-1)
    const progress = score / 100;

    // Permet de "cacher" une partie du cercle pour afficher la progression
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="relative w-[100px] h-[100px]">
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90" // Rotation pour démarrer le cercle en haut
            >
                {/* Cercle de fond */}
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="#e5e7eb"
                    strokeWidth={stroke}
                    fill="transparent"
                />

                {/* Cercle partiel avec dégradé */}
                <defs>
                    <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF97AD" />
                        <stop offset="100%" stopColor="#5171FF" />
                    </linearGradient>
                </defs>

                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="url(#grad)"
                    strokeWidth={stroke}
                    fill="transparent"

                    // Définit la longueur totale du trait (le cercle complet)
                    strokeDasharray={circumference}

                    // Décale le trait pour afficher seulement la progression
                    strokeDashoffset={strokeDashoffset}

                    strokeLinecap="round" // Rend les extrémités arrondies
                />
            </svg>

            {/* Score affiché au centre */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-semibold text-sm">{`${score}/100`}</span>
            </div>
        </div>
    );
};

export default ScoreCircle;