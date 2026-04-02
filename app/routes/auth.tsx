import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";

// Métadonnées de la page (titre + description)
export const meta = () => ([
    { title: 'Resumind | Auth '},
    { name: 'description', content: 'Connectez-vous à votre compte'},
])

const Auth = () => {
    // isLoading : état de chargement de l'auth
    // auth : contient les infos utilisateur + fonctions (signIn, signOut, isAuthenticated)
    const { isLoading, auth } = usePuterStore();

    const location = useLocation();

    // Récupère le paramètre "next" dans l'URL pour rediriger après connexion
    const next = location.search.split('next=')[1];

    const navigate = useNavigate(); // Permet de rediriger vers une autre page

    useEffect(() => {
        // Si l'utilisateur est connecté → redirection vers la page "next"
        if (auth.isAuthenticated) navigate(next);
    }, [auth.isAuthenticated, next]); // Se déclenche quand l'état d'auth change

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">

                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Bienvenue</h1>
                        <h2>Connectez-vous pour continuer</h2>
                    </div>

                    <div>
                        { isLoading ? (
                            // Affiché pendant le chargement de l'auth
                            <button className="auth-button animate-pulse">
                                <p>Connexion en cours...</p>
                            </button>
                        ) : (
                            <>
                                {auth.isAuthenticated ?  (
                                    // Si connecté → bouton de déconnexion
                                    <button className="auth-button" onClick={auth.signOut}>
                                        <p>Se Deconnecter</p>
                                    </button>
                                ) : (
                                    // Si non connecté → bouton de connexion
                                    <button className="auth-button" onClick={auth.signIn}>
                                        <p>Se connecter</p>
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                </section>
            </div>
        </main>
    )
}

export default Auth