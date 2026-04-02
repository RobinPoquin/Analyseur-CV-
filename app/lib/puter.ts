import { create } from "zustand";

// Extension du type global "window"
// → Permet à TypeScript de reconnaître window.puter (API externe)
declare global {
    interface Window {
        puter: {
            auth: {
                getUser: () => Promise<PuterUser>; // récupère l'utilisateur connecté
                isSignedIn: () => Promise<boolean>; // vérifie si connecté
                signIn: () => Promise<void>; // lance la connexion
                signOut: () => Promise<void>; // déconnecte l'utilisateur
            };
            fs: {
                write: (
                    path: string,
                    data: string | File | Blob
                ) => Promise<File | undefined>;  // écrit un fichier dans le storage Puter

                read: (path: string) => Promise<Blob>; // lit un fichier

                upload: (file: File[] | Blob[]) => Promise<FSItem>; // upload un ou plusieurs fichiers

                delete: (path: string) => Promise<void>; // supprime un fichier

                readdir: (path: string) => Promise<FSItem[] | undefined>; // liste les fichiers d’un dossier
            };
            ai: {
                chat: (
                    prompt: string | ChatMessage[],
                    imageURL?: string | PuterChatOptions,
                    testMode?: boolean,
                    options?: PuterChatOptions
                ) => Promise<Object>; // envoie une requête à l’IA

                img2txt: (
                    image: string | File | Blob,
                    testMode?: boolean
                ) => Promise<string>;  // convertit une image en texte
            };
            kv: {
                get: (key: string) => Promise<string | null>; // récupère une valeur via une clé

                set: (key: string, value: string) => Promise<boolean>; // enregistre une valeur

                delete: (key: string) => Promise<boolean>; // supprime une clé

                list: (pattern: string, returnValues?: boolean) => Promise<string[]>;// liste les clés

                flush: () => Promise<boolean>; // vide complètement le store
            };
        };
    }
}

// Interface globale du store Zustand
// → Définit toutes les données + fonctions accessibles dans l'app
interface PuterStore {
    isLoading: boolean; // état global de chargement (API en cours)
    error: string | null; // stocke une erreur globale
    puterReady: boolean; // indique si l'API Puter est chargée

    auth: {
        user: PuterUser | null; // utilisateur actuel (null si non connecté)
        isAuthenticated: boolean; // état de connexion

        signIn: () => Promise<void>; // lance connexion
        signOut: () => Promise<void>; // déconnexion

        // recharge les infos utilisateur depuis l'API
        refreshUser: () => Promise<void>;

        // vérifie si l'utilisateur est connecté
        checkAuthStatus: () => Promise<boolean>;

        getUser: () => PuterUser | null; // retourne l'utilisateur depuis le store (sans API)
    };

    fs: {
        // écrit un fichier
        write: (
            path: string,
            data: string | File | Blob
        ) => Promise<File | undefined>;

        // lit un fichier
        read: (path: string) => Promise<Blob | undefined>;

        // upload fichiers
        upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;

        // supprime fichier
        delete: (path: string) => Promise<void>;

        // liste contenu d’un dossier
        readDir: (path: string) => Promise<FSItem[] | undefined>;
    };

    ai: {
        // appel générique à l’IA
        chat: (
            prompt: string | ChatMessage[],
            imageURL?: string | PuterChatOptions,
            testMode?: boolean,
            options?: PuterChatOptions
        ) => Promise<AIResponse | undefined>;

        // envoie fichier + message pour analyse IA
        feedback: (
            path: string,
            message: string
        ) => Promise<AIResponse | undefined>;

        // OCR : image → texte
        img2txt: (
            image: string | File | Blob,
            testMode?: boolean
        ) => Promise<string | undefined>;
    };

    kv: {
        // récupère valeur
        get: (key: string) => Promise<string | null | undefined>;

        // enregistre valeur
        set: (key: string, value: string) => Promise<boolean | undefined>;

        // supprime clé
        delete: (key: string) => Promise<boolean | undefined>;

        // liste clés (ou clés + valeurs)
        list: (
            pattern: string,
            returnValues?: boolean
        ) => Promise<string[] | KVItem[] | undefined>;

        // vide tout le store
        flush: () => Promise<boolean | undefined>;
    };

    init: () => void; // initialise Puter (chargement + auth)
    clearError: () => void; // reset erreur
}

// Vérifie si window.puter est disponible côté navigateur (évite crash si non chargé)
const getPuter = (): typeof window.puter | null =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

export const usePuterStore = create<PuterStore>((set, get) => {
    // Centralise la gestion d'erreur + reset de l'état auth
    const setError = (msg: string) => {
        set({
            error: msg,
            isLoading: false,
            auth: {
                user: null,
                isAuthenticated: false,
                // On réinjecte les fonctions existantes pour ne pas les perdre
                signIn: get().auth.signIn,
                signOut: get().auth.signOut,
                refreshUser: get().auth.refreshUser,
                checkAuthStatus: get().auth.checkAuthStatus,
                getUser: get().auth.getUser,
            },
        });
    };

    // Vérifie si l'utilisateur est connecté et met à jour le store
    const checkAuthStatus = async (): Promise<boolean> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            const isSignedIn = await puter.auth.isSignedIn();
            if (isSignedIn) {
                const user = await puter.auth.getUser();
                set({
                    auth: {
                        user,
                        isAuthenticated: true,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getUser: () => user, // évite relire le state
                    },
                    isLoading: false,
                });
                return true;
            } else {
                // Aucun utilisateur connecté
                set({
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getUser: () => null,
                    },
                    isLoading: false,
                });
                return false;
            }
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Failed to check auth status";
            setError(msg);
            return false;
        }
    };

    // Lance la connexion puis resynchronise l'état
    const signIn = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signIn();
            await checkAuthStatus(); // refresh après login
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Echec de la connexion";
            setError(msg);
        }
    };

    // Déconnexion + reset manuel du state
    const signOut = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signOut();
            set({
                auth: {
                    user: null,
                    isAuthenticated: false,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getUser: () => null,
                },
                isLoading: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Sign out failed";
            setError(msg);
        }
    };

    // Recharge les infos utilisateur sans changer le reste
    const refreshUser = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const user = await puter.auth.getUser();
            set({
                auth: {
                    user,
                    isAuthenticated: true,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getUser: () => user,
                },
                isLoading: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to refresh user";
            setError(msg);
        }
    };

    // Initialise Puter (gestion async du script externe)
    const init = (): void => {
        const puter = getPuter();
        if (puter) {
            set({ puterReady: true });
            checkAuthStatus();
            return;
        }

        //attend que window.puter soit disponible
        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ puterReady: true });
                checkAuthStatus();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            if (!getPuter()) {
                setError("Puter.js n'a pas réussi à charger en 10 secondes");
            }
        }, 10000);
    };

    // Wrapper FS → vérifie puter avant chaque appel
    const write = async (path: string, data: string | File | Blob) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.fs.write(path, data);
    };

    const readDir = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.fs.readdir(path);
    };

    const readFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.fs.read(path);
    };

    const upload = async (files: File[] | Blob[]) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.fs.upload(files);
    };

    const deleteFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.fs.delete(path);
    };

    // Wrapper IA (cast du retour pour TypeScript)
    const chat = async (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
    ) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        // return puter.ai.chat(prompt, imageURL, testMode, options);
        return puter.ai.chat(prompt, imageURL, testMode, options) as Promise<
            AIResponse | undefined
        >;
    };

    // Envoie fichier + texte à l'IA
    const feedback = async (path: string, message: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }

        return puter.ai.chat(
            [
                {
                    role: "user",
                    content: [
                        {
                            type: "file",
                            puter_path: path,
                        },
                        {
                            type: "text",
                            text: message,
                        },
                    ],
                },
            ],
            { model: "claude-sonnet-4" }
        ) as Promise<AIResponse | undefined>;
    };

    const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.ai.img2txt(image, testMode);
    };

    const getKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.kv.get(key);
    };

    const setKV = async (key: string, value: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.kv.set(key, value);
    };

    const deleteKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.kv.delete(key);
    };

    const listKV = async (pattern: string, returnValues?: boolean) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        if (returnValues === undefined) {
            returnValues = false;
        }
        return puter.kv.list(pattern, returnValues);
    };

    const flushKV = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js n'est pas disponible");
            return;
        }
        return puter.kv.flush();
    };

    return {
        isLoading: true,
        error: null,
        puterReady: false,
        auth: {
            user: null,
            isAuthenticated: false,
            signIn,
            signOut,
            refreshUser,
            checkAuthStatus,
            getUser: () => get().auth.user,
        },
        fs: {
            write: (path: string, data: string | File | Blob) => write(path, data),
            read: (path: string) => readFile(path),
            readDir: (path: string) => readDir(path),
            upload: (files: File[] | Blob[]) => upload(files),
            delete: (path: string) => deleteFile(path),
        },
        ai: {
            chat: (
                prompt: string | ChatMessage[],
                imageURL?: string | PuterChatOptions,
                testMode?: boolean,
                options?: PuterChatOptions
            ) => chat(prompt, imageURL, testMode, options),
            feedback: (path: string, message: string) => feedback(path, message),
            img2txt: (image: string | File | Blob, testMode?: boolean) =>
                img2txt(image, testMode),
        },
        kv: {
            get: (key: string) => getKV(key),
            set: (key: string, value: string) => setKV(key, value),
            delete: (key: string) => deleteKV(key),
            list: (pattern: string, returnValues?: boolean) =>
                listKV(pattern, returnValues),
            flush: () => flushKV(),
        },
        init,
        clearError: () => set({ error: null }),
    };
});