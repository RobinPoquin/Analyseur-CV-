import {
  isRouteErrorResponse, // Permet de détecter si l'erreur vient du router (ex: 404)
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";

// Déclare les ressources à charger dans le <head> (ici les fonts Google)
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" }, // Optimise la connexion
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet", // Charge la police Inter
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  // Récupère la fonction init depuis le store global
  const { init } = usePuterStore();

  useEffect(() => {
    init(); // Initialise Puter au chargement du layout
  }, [init]); // Se relance si la fonction change

  return (
      <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <Meta /> {/* Injecte les meta des pages */}
        <Links /> {/* Injecte les liens définis au dessus */}
      </head>
      <body>
      <script src="https://js.puter.com/v2/"></script> {/* Script externe Puter */}

      {children} {/* Contenu des pages */}

      <ScrollRestoration /> {/* Restaure la position du scroll entre pages */}
      <Scripts /> {/* Scripts nécessaires à React Router */}
      </body>
      </html>
  );
}

export default function App() {
  return <Outlet />; // Affiche la route enfant active
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Variables utilisées pour afficher les infos d'erreur
  let message = "Oops!"; // Titre de l'erreur
  let details = "An unexpected error occurred."; // Description
  let stack: string | undefined; // Stack trace

  if (isRouteErrorResponse(error)) {
    // Cas erreur venant du router
    message = error.status === 404 ? "404" : "Error";

    details =
        error.status === 404
            ? "The requested page could not be found."
            : error.statusText || details;

  } else if (import.meta.env.DEV && error && error instanceof Error) {
    // En mode dev affiche les détails techniques
    details = error.message;
    stack = error.stack;
  }

  return (
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>

        {/* Affiche la stack seulement si elle existe */}
        {stack && (
            <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
        )}
      </main>
  );
}