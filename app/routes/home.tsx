import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { resumes } from "../../constants"; // Import du tableau de CV (données)
import ResumeCard from "~/components/ResumeCard";

// Fonction qui définit les métadonnées de la page
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Analyseur de CV" },
    { name: "description", content: "Votre application pour améliorer votre CV" },
  ];
}

// Composant principal de la page
export default function Home() {
  return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">

        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Traque tes recherches & Evalue ton CV</h1>
            <h2>Analyse tes CV et améliore toi avec des retours via IA</h2>
          </div>

          {/* Affiche la liste des CV seulement s'il y en a */}
          {resumes.length > 0 && (
              <div className="resumes-section">

                {/* Parcours du tableau resumes pour afficher chaque CV */}
                {resumes.map((resume) => (

                    // Composant pour afficher un CV
                    // key = obligatoire pour React (optimisation du rendu)
                    <ResumeCard key={resume.id} resume={resume} />
                ))}

              </div>
          )}

        </section>

      </main>
  );
}