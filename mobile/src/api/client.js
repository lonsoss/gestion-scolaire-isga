import axios from 'axios';
import { Platform } from 'react-native';

/* ------------------------------------------------------------------------
 * ADRESSE DU BACKEND
 * ------------------------------------------------------------------------
 * Point crucial : "localhost" ne designe pas la meme machine selon l'endroit
 * ou tourne l'application.
 *
 *   - Dans le navigateur (npm run web), le code s'execute sur la machine de
 *     developpement : "localhost" pointe bien vers WildFly.
 *
 *   - Sur un telephone ou un emulateur, le code s'execute sur l'APPAREIL :
 *     "localhost" designe le telephone lui-meme, pas l'ordinateur. Il faut
 *     donc l'adresse IP de la machine sur le reseau local.
 *
 * On choisit donc l'hote selon la plateforme, via le module Platform de
 * React Native.
 *
 * Comment trouver l'IP LAN de la machine ?
 *   - Windows : ouvrir un terminal, taper `ipconfig` et relever la ligne
 *     "Adresse IPv4" de la carte Wi-Fi (ex. 192.168.100.2).
 *   - C'est aussi l'IP affichee par Metro au demarrage, dans l'URL du type
 *     exp://192.168.x.x:8081.
 *
 * ATTENTION cote serveur : WildFly n'ecoute par defaut que sur 127.0.0.1, il
 * est donc injoignable depuis le reseau meme avec la bonne IP. Pour tester
 * depuis un telephone, le demarrer avec :
 *     standalone.bat -b 0.0.0.0
 * ---------------------------------------------------------------------- */
const HOST_LAN = '192.168.100.2'; // <-- a remplacer si l'IP de la machine change
const PORT = 8080;
const CONTEXTE = 'school-rest-jax-rs';

const HOST = Platform.OS === 'web' ? 'localhost' : HOST_LAN;

export const BASE_URL = `http://${HOST}:${PORT}/${CONTEXTE}/api`;

/* ------------------------------------------------------------------------
 * INSTANCE AXIOS UNIQUE
 * ------------------------------------------------------------------------
 * Tous les services (students.js, subjects.js, scores.js) importent CETTE
 * instance : l'adresse du serveur n'est donc ecrite qu'a un seul endroit.
 *
 * Pourquoi axios plutot que fetch ?
 *   1. axios parse le JSON automatiquement (pas besoin de `await res.json()`)
 *   2. axios leve une erreur sur les statuts non-2xx (404, 500...), alors que
 *      fetch considere une reponse 404 comme un succes. La gestion d'erreurs
 *      via try/catch est donc beaucoup plus simple et fiable.
 * ---------------------------------------------------------------------- */
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 s : au-dela, on considere le serveur injoignable
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Transforme une erreur axios en message lisible pour l'utilisateur.
 * Trois cas distincts, qui n'ont pas la meme cause ni la meme solution.
 */
export function messageErreur(error) {
  // 1. Le serveur a repondu, mais avec un statut d'erreur (404, 400, 500...)
  if (error.response) {
    const { status, data } = error.response;
    const detail = data && data.message ? data.message : '';
    if (status === 404) return detail || 'Element introuvable.';
    if (status === 400) return detail || 'Donnees invalides.';
    return `Erreur serveur (${status}). ${detail}`.trim();
  }
  // 2. La requete est partie mais aucune reponse : serveur eteint, mauvaise
  //    IP, ou WildFly demarre sans -b 0.0.0.0
  if (error.request) {
    return `Serveur injoignable a l'adresse ${BASE_URL}.\n\nVerifier que WildFly tourne et qu'il est demarre avec -b 0.0.0.0, et que l'IP dans src/api/client.js est correcte.`;
  }
  // 3. Erreur de configuration cote application
  return error.message || 'Une erreur inattendue est survenue.';
}

export default client;
