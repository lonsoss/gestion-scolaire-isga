import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { deleteStudent, getStudents } from '../api/students';
import { messageErreur } from '../api/client';
import Bouton from '../components/Bouton';
import CarteListe from '../components/CarteListe';
import Loader from '../components/Loader';
import { alerter, confirmer } from '../utils/dialogues';
import { couleurs, espacements } from '../theme';

/* Ecran LISTE des etudiants (le "R" de CRUD : Read).
 *
 * Trois etats sont necessaires pour toute requete HTTP, c'est un schema qu'on
 * retrouvera dans chaque ecran de liste :
 *   - `etudiants`  : les donnees recues
 *   - `chargement` : vrai pendant la requete -> on affiche l'indicateur
 *   - `erreur`     : message si la requete a echoue -> on l'affiche
 *
 * `useFocusEffect` (react-navigation) relance le chargement chaque fois que
 * l'ecran redevient visible. C'est ce qui fait que la liste est a jour au
 * retour du formulaire, sans avoir a passer les donnees d'un ecran a l'autre.
 */
export default function StudentsListScreen({ navigation }) {
  const [etudiants, setEtudiants] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    try {
      setErreur(null);
      setChargement(true);
      const donnees = await getStudents();
      setEtudiants(donnees);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      // `finally` : l'indicateur est coupe que la requete ait reussi ou echoue
      setChargement(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  function confirmerSuppression(etudiant) {
    confirmer(
      'Supprimer',
      `Supprimer ${etudiant.firstName} ${etudiant.lastName} ?\n\nAttention : ses notes ne seront pas supprimees automatiquement par le backend.`,
      async () => {
        try {
          await deleteStudent(etudiant.id);
          charger();
        } catch (e) {
          alerter('Erreur', messageErreur(e));
        }
      }
    );
  }

  if (chargement) return <Loader texte="Chargement des etudiants..." />;

  return (
    <View style={styles.ecran}>
      <View style={styles.barre}>
        <Bouton
          titre="+ Nouvel etudiant"
          onPress={() => navigation.navigate('EtudiantFormulaire', {})}
        />
      </View>

      {erreur ? (
        <View style={styles.zoneErreur}>
          <Text style={styles.texteErreur}>{erreur}</Text>
          <Bouton titre="Reessayer" variante="secondaire" onPress={charger} />
        </View>
      ) : null}

      <FlatList
        data={etudiants}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.liste}
        // ListEmptyComponent s'affiche uniquement quand `data` est vide
        ListEmptyComponent={
          erreur ? null : (
            <Text style={styles.vide}>
              Aucun etudiant. Utilise le bouton ci-dessus pour en ajouter un.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <CarteListe
            titre={`${item.firstName} ${item.lastName}`}
            sousTitre={item.email}
            detail={item.dateOfBirth ? `Ne(e) le ${item.dateOfBirth}` : null}
            onPress={() =>
              navigation.navigate('Releve', {
                studentId: item.id,
                nom: `${item.firstName} ${item.lastName}`,
              })
            }
            onModifier={() =>
              navigation.navigate('EtudiantFormulaire', { etudiant: item })
            }
            onSupprimer={() => confirmerSuppression(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  barre: { padding: espacements.lg, paddingBottom: espacements.sm },
  liste: { padding: espacements.lg, paddingTop: espacements.sm },
  vide: {
    textAlign: 'center',
    color: couleurs.texteSecondaire,
    marginTop: espacements.xl,
    fontSize: 15,
    lineHeight: 22,
  },
  zoneErreur: {
    margin: espacements.lg,
    marginTop: 0,
    padding: espacements.lg,
    backgroundColor: couleurs.dangerFond,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: couleurs.dangerBordure,
  },
  texteErreur: {
    color: couleurs.danger,
    fontSize: 14,
    marginBottom: espacements.md,
    lineHeight: 20,
  },
});
