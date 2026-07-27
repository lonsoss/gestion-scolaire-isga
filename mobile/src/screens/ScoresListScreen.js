import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { deleteScore, getScores } from '../api/scores';
import { getStudents, nomComplet } from '../api/students';
import { getSubjects } from '../api/subjects';
import { messageErreur } from '../api/client';
import Bouton from '../components/Bouton';
import CarteListe from '../components/CarteListe';
import Loader from '../components/Loader';
import { alerter, confirmer } from '../utils/dialogues';
import { couleurs, espacements } from '../theme';

/* Ecran LISTE des notes.
 *
 * Une note ne contient que `studentId` et `subjectId` : afficher "1" et "2" ne
 * dirait rien a l'utilisateur. On charge donc les trois listes et on fait la
 * correspondance id -> nom cote application.
 *
 * Les trois requetes sont lancees EN PARALLELE avec Promise.all : elles sont
 * independantes, les enchainer avec trois `await` successifs serait trois fois
 * plus lent.
 */
export default function ScoresListScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    try {
      setErreur(null);
      setChargement(true);
      const [listeNotes, listeEtudiants, listeMatieres] = await Promise.all([
        getScores(),
        getStudents(),
        getSubjects(),
      ]);
      setNotes(listeNotes);
      setEtudiants(listeEtudiants);
      setMatieres(listeMatieres);
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

  /** Nom de l'etudiant correspondant a un id, ou un repli explicite. */
  function nomEtudiant(studentId) {
    const trouve = etudiants.find((e) => Number(e.id) === Number(studentId));
    // Le backend n'ayant pas de cle etrangere, une note peut pointer vers un
    // etudiant supprime : on le signale plutot que d'afficher du vide.
    return trouve ? nomComplet(trouve) : `Etudiant #${studentId} (introuvable)`;
  }

  function nomMatiere(subjectId) {
    const trouve = matieres.find((m) => Number(m.id) === Number(subjectId));
    return trouve ? trouve.name : `Matiere #${subjectId} (introuvable)`;
  }

  function confirmerSuppression(note) {
    confirmer(
      'Supprimer',
      `Supprimer la note de ${nomEtudiant(note.studentId)} en ${nomMatiere(note.subjectId)} ?`,
      async () => {
        try {
          await deleteScore(note.id);
          charger();
        } catch (e) {
          alerter('Erreur', messageErreur(e));
        }
      }
    );
  }

  if (chargement) return <Loader texte="Chargement des notes..." />;

  const peutAjouter = etudiants.length > 0 && matieres.length > 0;

  return (
    <View style={styles.ecran}>
      <View style={styles.barre}>
        <Bouton
          titre="+ Nouvelle note"
          onPress={() => navigation.navigate('NoteFormulaire', {})}
          // Sans etudiant ni matiere, le formulaire n'aurait rien a proposer
          // dans ses listes de selection.
          desactive={!peutAjouter}
        />
        {!peutAjouter ? (
          <Text style={styles.avertissement}>
            Il faut au moins un etudiant et une matiere avant de saisir une note.
          </Text>
        ) : null}
      </View>

      {erreur ? (
        <View style={styles.zoneErreur}>
          <Text style={styles.texteErreur}>{erreur}</Text>
          <Bouton titre="Reessayer" variante="secondaire" onPress={charger} />
        </View>
      ) : null}

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          erreur ? null : <Text style={styles.vide}>Aucune note enregistree.</Text>
        }
        renderItem={({ item }) => (
          <CarteListe
            titre={nomEtudiant(item.studentId)}
            sousTitre={nomMatiere(item.subjectId)}
            detail={[item.examType, item.examDate].filter(Boolean).join(' — ')}
            valeur={item.score}
            onModifier={() => navigation.navigate('NoteFormulaire', { note: item })}
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
  avertissement: {
    marginTop: espacements.sm,
    fontSize: 13,
    color: couleurs.texteSecondaire,
    textAlign: 'center',
  },
  liste: { padding: espacements.lg, paddingTop: espacements.sm },
  vide: {
    textAlign: 'center',
    color: couleurs.texteSecondaire,
    marginTop: espacements.xl,
    fontSize: 15,
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
