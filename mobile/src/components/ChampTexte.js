import { StyleSheet, Text, TextInput, View } from 'react-native';
import { couleurs, espacements, rayon } from '../theme';

/**
 * Champ de saisie avec son libelle.
 *
 * Composant "controle" : sa valeur vient toujours des props (`valeur`) et
 * toute frappe remonte au parent via `onChangeText`. L'ecran parent reste donc
 * la seule source de verite pour les donnees du formulaire.
 *
 * Props :
 *   - label, valeur, onChangeText
 *   - placeholder, clavier ('default' | 'numeric' | 'email-address')
 *   - erreur : message d'erreur affiche sous le champ
 */
export default function ChampTexte({
  label,
  valeur,
  onChangeText,
  placeholder,
  clavier = 'default',
  erreur,
  multiligne = false,
}) {
  return (
    <View style={styles.groupe}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.champ,
          multiligne && styles.multiligne,
          erreur && styles.champErreur,
        ]}
        value={valeur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={couleurs.texteSecondaire}
        keyboardType={clavier}
        autoCapitalize={clavier === 'email-address' ? 'none' : 'sentences'}
        multiline={multiligne}
      />
      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  groupe: { marginBottom: espacements.lg },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: couleurs.texte,
    marginBottom: espacements.xs,
  },
  champ: {
    backgroundColor: couleurs.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon,
    paddingHorizontal: espacements.md,
    paddingVertical: espacements.md,
    fontSize: 15,
    color: couleurs.texte,
  },
  multiligne: { minHeight: 90, textAlignVertical: 'top' },
  champErreur: { borderColor: couleurs.danger },
  erreur: {
    color: couleurs.danger,
    fontSize: 13,
    marginTop: espacements.xs,
  },
});
