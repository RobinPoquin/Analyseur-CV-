import { cn } from "~/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";

const ScoreBadge = ({ score }: { score: number }) => {
    return (
        <div
            className={cn(
                "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
                // Couleur dynamique selon le score
                score > 69
                    ? "bg-badge-green"
                    : score > 39
                        ? "bg-badge-yellow"
                        : "bg-badge-red"
            )}
        >
            <img
                // Icône différente selon bon / mauvais score
                src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
                alt="score"
                className="size-4"
            />
            <p
                className={cn(
                    "text-sm font-medium",
                    // Couleur du texte adaptée au score
                    score > 69
                        ? "text-badge-green-text"
                        : score > 39
                            ? "text-badge-yellow-text"
                            : "text-badge-red-text"
                )}
            >
                {score}/100
            </p>
        </div>
    );
};

// Header d'une catégorie (titre + score)
const CategoryHeader = ({
                            title,
                            categoryScore,
                        }: {
    title: string;
    categoryScore: number;
}) => {
    return (
        <div className="flex flex-row gap-4 items-center py-2">
            <p className="text-2xl font-semibold">{title}</p>
            <ScoreBadge score={categoryScore} />
        </div>
    );
};

// Contenu détaillé d'une catégorie (tips + explications)
const CategoryContent = ({
                             tips,
                         }: {
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
    return (
        <div className="flex flex-col gap-4 items-center w-full">

            {/* Liste rapide des points (résumé) */}
            <div className="bg-gray-50 w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                    <div className="flex flex-row gap-2 items-center" key={index}>
                        <img
                            // Icône selon type de conseil
                            src={
                                tip.type === "good"
                                    ? "/icons/check.svg"
                                    : "/icons/warning.svg"
                            }
                            alt="score"
                            className="size-5"
                        />
                        <p className="text-xl text-gray-500 ">{tip.tip}</p>
                    </div>
                ))}
            </div>

            {/* Détails complets avec explication */}
            <div className="flex flex-col gap-4 w-full">
                {tips.map((tip, index) => (
                    <div
                        key={index + tip.tip} // clé unique combinée
                        className={cn(
                            "flex flex-col gap-2 rounded-2xl p-4",
                            // Style différent selon positif / amélioration
                            tip.type === "good"
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                        )}
                    >
                        <div className="flex flex-row gap-2 items-center">
                            <img
                                src={
                                    tip.type === "good"
                                        ? "/icons/check.svg"
                                        : "/icons/warning.svg"
                                }
                                alt="score"
                                className="size-5"
                            />
                            <p className="text-xl font-semibold">{tip.tip}</p>
                        </div>

                        {/* Explication du conseil */}
                        <p>{tip.explanation}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Composant principal : affiche toutes les catégories sous forme d'accordéon
const Details = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <Accordion>

                {/* Chaque section correspond à une catégorie du feedback */}
                <AccordionItem id="tone-style">
                    <AccordionHeader itemId="tone-style">
                        <CategoryHeader
                            title="Ton et Style"
                            categoryScore={feedback.toneAndStyle.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="tone-style">
                        <CategoryContent tips={feedback.toneAndStyle.tips} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="content">
                    <AccordionHeader itemId="content">
                        <CategoryHeader
                            title="Contenu"
                            categoryScore={feedback.content.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="content">
                        <CategoryContent tips={feedback.content.tips} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="structure">
                    <AccordionHeader itemId="structure">
                        <CategoryHeader
                            title="Structure"
                            categoryScore={feedback.structure.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="structure">
                        <CategoryContent tips={feedback.structure.tips} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="skills">
                    <AccordionHeader itemId="skills">
                        <CategoryHeader
                            title="Compétences"
                            categoryScore={feedback.skills.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="skills">
                        <CategoryContent tips={feedback.skills.tips} />
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    );
};

export default Details;