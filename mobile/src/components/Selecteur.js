import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs, espacements, rayon } from '../theme';

/**
 * Liste deroulante de selection, basee sur le composant Picker vu en cours
 * (chapitre 4, page 75 : `npx expo install @react-native-picker/picker`).
 *
 * Attributs du Picker utilises ici, tels que decrits dans le cours :
 *   - selectedValue : la valeur actuellement selectionnee
 *   - onValueChange : appele avec la valeur choisie
 *   - enabled       : desactive le Picker si false
 *   - prompt        : titre de la boite de dialogue (Android)
 *
 * A quoi ca sert ici : rattacher une Note a un Etudiant et a une Matiere sans
 * saisie libre d'identifiant. La table `scores` du backend n'ayant AUCUNE cle
 * etrangere, un studentId inexistant serait accepte sans erreur — c'est donc a
 * l'application de garantir que l'id choisi existe vraiment.
 *
 * Props :
 *   - label       : libelle du champ
 *   - options     : tableau d'objets venant de l'API
 *   - valeur      : id selectionne (ou null)
 *   - onChange    : appele avec le nouvel id
 *   - libelle     : fonction (option) => texte affiche
 *   - placeholder : texte de l'entree "aucun choix"
 *   - erreur      : message d'erreur affiche sous le champ
 */
export default function Selecteur({
  label,
  options = [],
  valeur,
  onChange,
  libelle,
  placeholder = 'Selectionner...',
  erreur,
}) {
  const vide = options.length === 0;

  return (
    <View style={styles.groupe}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.cadre, erreur && styles.cadreErreur]}>
        <Picker
          selectedValue={valeur === null || valeur === undefined ? '' : String(valeur)}
          // Le Picker renvoie toujours une chaine : on reconvertit en nombre
          // (ou null pour l'entree placeholder) avant de remonter au parent.
          onValueChange={(v) => onChange(v === '' ? null : Number(v))}
          enabled={!vide}
          prompt={label}
          style={styles.picker}
        >
          <Picker.Item label={vide ? 'Aucun element disponible' : placeholder} value="" />
          {options.map((option) => (
            <Picker.Item
              key={String(option.id)}
              label={libelle(option)}
              value={String(option.id)}
            />
          ))}
        </Picker>
      </View>

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
  cadre: {
    backgroundColor: couleurs.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon,
    // overflow: 'hidden' pour que le Picker respecte les coins arrondis
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cadreErreur: { borderColor: couleurs.danger },
  picker: { color: couleurs.texte },
  erreur: {
    color: couleurs.danger,
    fontSize: 13,
    marginTop: espacements.xs,
  },
});
