import { Alert, Platform } from 'react-native';

/* ------------------------------------------------------------------------
 * DIALOGUES MULTI-PLATEFORMES
 * ------------------------------------------------------------------------
 * Le composant Alert de React Native N'EST PAS implemente par
 * react-native-web : sur navigateur, Alert.alert() ne fait strictement rien,
 * sans lever d'erreur. Un bouton "Supprimer" reposant dessus semble donc
 * casse alors que le code est correct — il attend une confirmation qui
 * n'arrivera jamais.
 *
 * On aiguille donc selon la plateforme :
 *   - web    : window.alert / window.confirm, natifs du navigateur
 *   - mobile : Alert.alert de React Native, qui donne le rendu natif attendu
 *
 * Regrouper cette logique ici evite de repeter le test dans chaque ecran.
 * ---------------------------------------------------------------------- */

const SUR_LE_WEB = Platform.OS === 'web';

/** Message simple d'information ou d'erreur. */
export function alerter(titre, message) {
  if (SUR_LE_WEB) {
    window.alert(message ? `${titre}\n\n${message}` : titre);
    return;
  }
  Alert.alert(titre, message);
}

/**
 * Demande une confirmation avant une action destructrice.
 * `onConfirmer` n'est appelee que si l'utilisateur valide.
 */
export function confirmer(titre, message, onConfirmer, texteConfirmer = 'Supprimer') {
  if (SUR_LE_WEB) {
    if (window.confirm(`${titre}\n\n${message}`)) {
      onConfirmer();
    }
    return;
  }
  Alert.alert(titre, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: texteConfirmer, style: 'destructive', onPress: onConfirmer },
  ]);
}
