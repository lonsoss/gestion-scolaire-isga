import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getStudents, nomComplet } from '../api/students';
import { messageErreur } from '../api/client';
import Bouton from '../components/Bouton';
import Loader from '../components/Loader';
import { couleurs, espacements, rayon } from '../theme';

/* Choix de l'etudiant dont on veut consulter le relevé.
 * Simple liste : on appuie sur un etudiant pour ouvrir son relevé.
 */
export default function RelevesListScreen({ navigation }) {
  const [etudiants, setEtudiants] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    try {
      setErreur(null);
      setChargement(true);
      setEtudiants(await getStudents());
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

  if (chargement) return <Loader texte="Chargement des etudiants..." />;

  if (erreur) {
    return (
      <View style={styles.centre}>
        <Text style={styles.texteErreur}>{erreur}</Text>
        <Bouton titre="Reessayer" onPress={charger} />
      </View>
    );
  }

  return (
    <View style={styles.ecran}>
      <Text style={styles.consigne}>
        Choisir un etudiant pour consulter son relevé de notes.
      </Text>

      <FlatList
        data={etudiants}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          <Text style={styles.vide}>Aucun etudiant enregistre.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.carte}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Releve', {
                studentId: item.id,
                nom: nomComplet(item),
              })
            }
          >
            <View style={styles.zoneTexte}>
              <Text style={styles.nom}>{nomComplet(item)}</Text>
              {item.email ? <Text style={styles.email}>{item.email}</Text> : null}
            </View>
            <Text style={styles.fleche}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  centre: {
    flex: 1,
    justifyContent: 'center',
    padding: espacements.xl,
    backgroundColor: couleurs.fond,
  },
  consigne: {
    fontSize: 14,
    color: couleurs.texteSecondaire,
    padding: espacements.lg,
    paddingBottom: espacements.sm,
  },
  liste: { padding: espacements.lg, paddingTop: espacements.sm },
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espacements.lg,
    marginBottom: espacements.md,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  zoneTexte: { flex: 1 },
  nom: { fontSize: 16, fontWeight: '700', color: couleurs.texte },
  email: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2 },
  fleche: { fontSize: 26, color: couleurs.texteSecondaire },
  vide: {
    textAlign: 'center',
    color: couleurs.texteSecondaire,
    marginTop: espacements.xl,
    fontSize: 15,
  },
  texteErreur: {
    color: couleurs.danger,
    fontSize: 14,
    marginBottom: espacements.lg,
    lineHeight: 20,
  },
});
