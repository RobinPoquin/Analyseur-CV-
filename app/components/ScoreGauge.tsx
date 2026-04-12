import { useEffect, useRef, useState } from "react";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
    const [pathLength, setPathLength] = useState(0); // longueur totale de l'arc SVG
    const pathRef = useRef<SVGPathElement>(null); // référence vers le path SVG

    const percentage = score / 100; // convertit le score en pourcentage (0 → 1)

    useEffect(() => {
        // Récupère la longueur réelle du path SVG (nécessaire pour l'animation)
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-20">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <defs>
                        {/* Dégradé utilisé pour l'arc principal */}
                        <linearGradient
                            id="gaugeGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#fca5a5" />
                        </linearGradient>
                    </defs>

                    {/* Arc de fond (gris) */}
                    <path
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />

                    {/* Arc principal (progression du score) */}
                    <path
                        ref={pathRef}
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={pathLength} // Définit la longueur totale visible du trait

                        strokeDashoffset={pathLength * (1 - percentage)} // Masque une partie du trait pour afficher uniquement le pourcentage
                    />
                </svg>

                {/* Affichage du score au centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <div className="text-xl font-semibold pt-4">{score}/100</div>
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;