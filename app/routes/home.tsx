import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

// Fonction qui définit les métadonnées de la page
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Analyseur de CV" },
    { name: "description", content: "Votre application pour améliorer votre CV" },
  ];
}

// Composant principal de la page
export default function Home() {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false)

    useEffect(() => {
        // Redirige vers la page d'auth si l'utilisateur n'est pas connecté
        if (!auth.isAuthenticated) navigate('/auth?next=/')
    }, [auth.isAuthenticated]);

    useEffect(() => {
        const loadResumes = async() => {
            setLoadingResumes(true); // active le loader pendant la récupération

            // Récupère tous les CV stockés avec la clé "resume:*"
            const resumes = (await kv.list('resume:*', true)) as KVItem[];

            // Convertit chaque valeur (string JSON) en objet JS exploitable
            const parsedResumes = resumes?.map((resume) => (
                JSON.parse(resume.value) as Resume
            ))

            console.log("parsedResumes", parsedResumes);

            setResumes(parsedResumes || []); // fallback tableau vide si undefined
            setLoadingResumes(false); // désactive le loader
        }

        loadResumes();
    }, []);

  return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">

        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Traque tes recherches & Evalue ton CV</h1>
              {!loadingResumes && resumes?.length === 0 ? (
                  <h2>Aucun CV trouvé. Importer votre premier CV pour obtenir des conseils</h2>
              ): (
                  <h2>Analyse tes CV et améliore toi avec des retours via IA</h2>
              )}
          </div>
            {loadingResumes && (
                <div className="flex flex-col items-center justify-center">
                    <img src="/images/resume-scan-2.gif" className="w-[200px]" />
                </div>
            )}

          {/* Affiche la liste des CV seulement s'il y en a */}
          {!loadingResumes && resumes.length > 0 && (
              <div className="resumes-section">

                {/* Parcours du tableau resumes pour afficher chaque CV */}
                {resumes.map((resume) => (

                    // Composant pour afficher un CV
                    // key = obligatoire pour React (optimisation du rendu)
                    <ResumeCard key={resume.id} resume={resume} />
                ))}
              </div>
          )}

            {!loadingResumes && resumes?.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-10 gap-4">
                    <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                        Importer votre CV
                    </Link>
                </div>
            )}
        </section>

      </main>
  );
}