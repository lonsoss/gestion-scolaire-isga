import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { couleurs } from '../theme';

/**
 * Indicateur de chargement affiche pendant les requetes HTTP.
 * Props :
 *   - texte : message optionnel sous l'indicateur
 */
export default function Loader({ texte = 'Chargement...' }) {
  return (
    <View style={styles.conteneur}>
      <ActivityIndicator size="large" color={couleurs.primaire} />
      <Text style={styles.texte}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // flex: 1 pour occuper tout l'espace disponible, puis centrage sur les deux
  // axes grace a Flexbox (justifyContent = axe vertical, alignItems = horizontal)
  conteneur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  texte: {
    marginTop: 12,
    color: couleurs.texteSecondaire,
    fontSize: 15,
  },
});
