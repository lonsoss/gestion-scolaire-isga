import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { couleurs, espacements, rayon } from '../theme';

/**
 * Bouton reutilisable, construit avec TouchableOpacity (chapitre 4 du cours).
 *
 * TouchableOpacity reduit l'opacite de son enveloppe au moment du clic, ce qui
 * donne le retour visuel a l'appui. On le prefere au composant Button standard
 * parce que Button n'accepte aucun style personnalise.
 *
 * Props (memes conventions que le composant Button du cours) :
 *   - titre        : le texte affiche
 *   - onPress      : la fonction appelee au clic
 *   - variante     : 'primaire' (defaut) | 'danger' | 'secondaire'
 *   - desactive    : booleen, grise le bouton et bloque le clic
 *   - enChargement : affiche un indicateur a la place du texte
 */
export default function Bouton({
  titre,
  onPress,
  variante = 'primaire',
  desactive = false,
  enChargement = false,
  style,
}) {
  const inactif = desactive || enChargement;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactif}
      activeOpacity={0.75}
      style={[styles.base, styles[variante], inactif && styles.inactif, style]}
    >
      {enChargement ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          style={[
            styles.texte,
            variante === 'secondaire' && styles.texteSecondaire,
          ]}
        >
          {titre}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: espacements.md,
    paddingHorizontal: espacements.lg,
    borderRadius: rayon,
    // Centrage du libelle sur les deux axes (Flexbox)
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  primaire: { backgroundColor: couleurs.primaire },
  danger: { backgroundColor: couleurs.danger },
  secondaire: {
    backgroundColor: couleurs.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  inactif: { backgroundColor: couleurs.desactive, borderColor: couleurs.desactive },
  texte: { color: '#fff', fontSize: 15, fontWeight: '600' },
  texteSecondaire: { color: couleurs.texte },
});
