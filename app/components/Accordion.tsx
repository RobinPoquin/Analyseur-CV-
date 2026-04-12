import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

// Type du contexte partagé entre les composants Accordion
interface AccordionContextType {
    activeItems: string[]; // ids actuellement ouverts
    toggleItem: (id: string) => void; // ouvre / ferme un item
    isItemActive: (id: string) => boolean; // vérifie si un item est ouvert
}

// Création du contexte (partage d'état entre composants)
const AccordionContext = createContext<AccordionContextType | undefined>(
    undefined
);

// Hook personnalisé pour accéder au contexte
const useAccordion = () => {
    const context = useContext(AccordionContext);

    // Sécurité : empêche d'utiliser le hook hors du provider
    if (!context) {
        throw new Error("Accordion components must be used within an Accordion");
    }

    return context;
};

interface AccordionProps {
    children: ReactNode;
    defaultOpen?: string; // item ouvert par défaut
    allowMultiple?: boolean; // autorise plusieurs items ouverts
    className?: string;
}

// Composant principal Accordion (gère l'état global)
export const Accordion: React.FC<AccordionProps> = ({
                                                        children,
                                                        defaultOpen,
                                                        allowMultiple = false,
                                                        className = "",
                                                    }) => {
    // Liste des items ouverts (par défaut : un seul si defaultOpen)
    const [activeItems, setActiveItems] = useState<string[]>(
        defaultOpen ? [defaultOpen] : []
    );

    const toggleItem = (id: string) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                // Mode multi : ajoute ou retire l'item
                return prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id];
            } else {
                // Mode simple : un seul ouvert à la fois
                return prev.includes(id) ? [] : [id];
            }
        });
    };

    // Vérifie si un item est actif
    const isItemActive = (id: string) => activeItems.includes(id);

    return (
        <AccordionContext.Provider
            value={{ activeItems, toggleItem, isItemActive }}
        >
            <div className={`space-y-2 ${className}`}>{children}</div>
        </AccordionContext.Provider>
    );
};

interface AccordionItemProps {
    id: string;
    children: ReactNode;
    className?: string;
}

// Conteneur d'un item (structure uniquement)
export const AccordionItem: React.FC<AccordionItemProps> = ({
                                                                id,
                                                                children,
                                                                className = "",
                                                            }) => {
    return (
        <div className={`overflow-hidden border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
};

interface AccordionHeaderProps {
    itemId: string;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

// Header cliquable qui ouvre / ferme l'item
export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
                                                                    itemId,
                                                                    children,
                                                                    className = "",
                                                                    icon,
                                                                    iconPosition = "right",
                                                                }) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId); // état de l'item

    // Icône par défaut avec rotation si ouvert
    const defaultIcon = (
        <svg
            className={cn("w-5 h-5 transition-transform duration-200", {
                "rotate-180": isActive, // rotation si ouvert
            })}
            fill="none"
            stroke="#98A2B3"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );

    const handleClick = () => {
        toggleItem(itemId); // ouvre / ferme l'item
    };

    return (
        <button
            onClick={handleClick}
            className={`
                w-full px-4 py-3 text-left
                transition-colors duration-200 flex items-center justify-between
                ${className}
            `}
        >
            <div className="flex items-center space-x-3">
                {/* Icône à gauche si demandé */}
                {iconPosition === "left" && (icon || defaultIcon)}

                <div className="flex-1">{children}</div>
            </div>

            {/* Icône à droite par défaut */}
            {iconPosition === "right" && (icon || defaultIcon)}
        </button>
    );
};

interface AccordionContentProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

// Contenu qui apparaît / disparaît
export const AccordionContent: React.FC<AccordionContentProps> = ({
                                                                      itemId,
                                                                      children,
                                                                      className = "",
                                                                  }) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <div
            className={`
                overflow-hidden transition-all duration-300
                ${isActive ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}
                ${className}
            `}
        >
            {/* Contenu affiché uniquement si actif */}
            <div className="px-4 py-3">{children}</div>
        </div>
    );
};