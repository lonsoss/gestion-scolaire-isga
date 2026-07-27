import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { deleteSubject, getSubjects } from '../api/subjects';
import { messageErreur } from '../api/client';
import Bouton from '../components/Bouton';
import CarteListe from '../components/CarteListe';
import Loader from '../components/Loader';
import { alerter, confirmer } from '../utils/dialogues';
import { couleurs, espacements } from '../theme';

/* Ecran LISTE des matieres.
 * Meme structure que la liste des etudiants : trois etats (donnees, chargement,
 * erreur) et rechargement automatique au retour sur l'ecran.
 */
export default function SubjectsListScreen({ navigation }) {
  const [matieres, setMatieres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    try {
      setErreur(null);
      setChargement(true);
      const donnees = await getSubjects();
      setMatieres(donnees);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  function confirmerSuppression(matiere) {
    confirmer(
      'Supprimer',
      `Supprimer la matiere ${matiere.name} ?\n\nLes notes rattachees a cette matiere ne seront pas supprimees automatiquement.`,
      async () => {
        try {
          await deleteSubject(matiere.id);
          charger();
        } catch (e) {
          alerter('Erreur', messageErreur(e));
        }
      }
    );
  }

  if (chargement) return <Loader texte="Chargement des matieres..." />;

  return (
    <View style={styles.ecran}>
      <View style={styles.barre}>
        <Bouton
          titre="+ Nouvelle matiere"
          onPress={() => navigation.navigate('MatiereFormulaire', {})}
        />
      </View>

      {erreur ? (
        <View style={styles.zoneErreur}>
          <Text style={styles.texteErreur}>{erreur}</Text>
          <Bouton titre="Reessayer" variante="secondaire" onPress={charger} />
        </View>
      ) : null}

      <FlatList
        data={matieres}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          erreur ? null : (
            <Text style={styles.vide}>
              Aucune matiere. Il en faut au moins une pour pouvoir saisir des notes.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <CarteListe
            titre={item.name}
            sousTitre={item.code}
            detail={item.description}
            // `credits` sert de coefficient : on l'affiche explicitement
            valeur={`coef ${item.credits}`}
            onModifier={() =>
              navigation.navigate('MatiereFormulaire', { matiere: item })
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
