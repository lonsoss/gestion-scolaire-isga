import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { createScore, updateScore } from '../api/scores';
import { getStudents, nomComplet } from '../api/students';
import { getSubjects } from '../api/subjects';
import { messageErreur } from '../api/client';
import Bouton from '../components/Bouton';
import ChampTexte from '../components/ChampTexte';
import Loader from '../components/Loader';
import Selecteur from '../components/Selecteur';
import { alerter } from '../utils/dialogues';
import { NOTE_MAX } from '../utils/releve';
import { couleurs, espacements } from '../theme';

/* Ecran FORMULAIRE des notes — creation et modification.
 *
 * C'est ici que la RELATION entre les trois entites se joue : une note est
 * rattachee a un Etudiant ET a une Matiere. Les deux sont choisis dans des
 * listes de selection alimentees par l'API (composant Selecteur), jamais par
 * saisie libre d'identifiant.
 *
 * Pourquoi c'est important : la table `scores` du backend n'a AUCUNE cle
 * etrangere. Un POST avec studentId = 999 serait accepte sans erreur et
 * creerait une note orpheline. La coherence doit donc etre garantie ici.
 */
export default function ScoreFormScreen({ navigation, route }) {
  const note = route.params && route.params.note;
  const modeEdition = Boolean(note);

  const [etudiants, setEtudiants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState(null);

  const [studentId, setStudentId] = useState(note ? note.studentId : null);
  const [subjectId, setSubjectId] = useState(note ? note.subjectId : null);
  const [score, setScore] = useState(
    note && note.score !== null && note.score !== undefined ? String(note.score) : ''
  );
  const [examDate, setExamDate] = useState(note ? note.examDate || '' : '');
  const [examType, setExamType] = useState(note ? note.examType || '' : '');

  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: modeEdition ? 'Modifier la note' : 'Nouvelle note',
    });
  }, [navigation, modeEdition]);

  // Chargement des listes de selection au montage de l'ecran
  const chargerListes = useCallback(async () => {
    try {
      setErreurChargement(null);
      setChargement(true);
      const [listeEtudiants, listeMatieres] = await Promise.all([
        getStudents(),
        getSubjects(),
      ]);
      setEtudiants(listeEtudiants);
      setMatieres(listeMatieres);
    } catch (e) {
      setErreurChargement(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerListes();
  }, [chargerListes]);

  function valider() {
    const nouvelles = {};
    if (!studentId) nouvelles.studentId = 'Choisir un etudiant.';
    if (!subjectId) nouvelles.subjectId = 'Choisir une matiere.';

    const valeurNote = Number(score.replace(',', '.'));
    if (!score.trim()) {
      nouvelles.score = 'La note est obligatoire.';
    } else if (!Number.isFinite(valeurNote)) {
      nouvelles.score = 'La note doit etre un nombre.';
    } else if (valeurNote < 0 || valeurNote > NOTE_MAX) {
      nouvelles.score = `La note doit etre comprise entre 0 et ${NOTE_MAX}.`;
    }

    if (examDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(examDate.trim())) {
      nouvelles.examDate = 'Format attendu : AAAA-MM-JJ (ex. 2026-01-15).';
    }

    setErreurs(nouvelles);
    return Object.keys(nouvelles).length === 0;
  }

  async function enregistrer() {
    if (!valider()) return;

    const donnees = {
      studentId: Number(studentId),
      subjectId: Number(subjectId),
      score: Number(score.replace(',', '.')),
      examDate: examDate.trim(),
      examType: examType.trim(),
    };

    try {
      setEnvoi(true);
      if (modeEdition) {
        await updateScore(note.id, donnees);
      } else {
        await createScore(donnees);
      }
      navigation.goBack();
    } catch (e) {
      alerter('Erreur', messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <Loader texte="Chargement des listes..." />;

  if (erreurChargement) {
    return (
      <View style={styles.centre}>
        <Text style={styles.texteErreur}>{erreurChargement}</Text>
        <Bouton titre="Reessayer" onPress={chargerListes} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <Selecteur
        label="Etudiant *"
        options={etudiants}
        valeur={studentId}
        onChange={setStudentId}
        libelle={(e) => nomComplet(e)}
        placeholder="Choisir un etudiant"
        erreur={erreurs.studentId}
      />

      <Selecteur
        label="Matiere *"
        options={matieres}
        valeur={subjectId}
        onChange={setSubjectId}
        libelle={(m) => `${m.name} (${m.code}) — coef ${m.credits}`}
        placeholder="Choisir une matiere"
        erreur={erreurs.subjectId}
      />

      <ChampTexte
        label={`Note (sur ${NOTE_MAX}) *`}
        valeur={score}
        onChangeText={setScore}
        placeholder="15.5"
        clavier="numeric"
        erreur={erreurs.score}
      />
      <ChampTexte
        label="Type d'examen"
        valeur={examType}
        onChangeText={setExamType}
        placeholder="MIDTERM, FINAL..."
      />
      <ChampTexte
        label="Date de l'examen"
        valeur={examDate}
        onChangeText={setExamDate}
        placeholder="2026-01-15"
        erreur={erreurs.examDate}
      />

      <Text style={styles.info}>
        Un etudiant peut avoir plusieurs notes dans la meme matiere (par exemple
        MIDTERM et FINAL). Dans le relevé, la moyenne de la matiere est alors la
        moyenne de ces examens.
      </Text>

      <View style={styles.actions}>
        <Bouton
          titre={modeEdition ? 'Enregistrer' : 'Ajouter'}
          onPress={enregistrer}
          enChargement={envoi}
        />
        <Bouton
          titre="Annuler"
          variante="secondaire"
          onPress={() => navigation.goBack()}
          style={styles.annuler}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: espacements.lg },
  centre: {
    flex: 1,
    justifyContent: 'center',
    padding: espacements.xl,
    backgroundColor: couleurs.fond,
  },
  texteErreur: {
    color: couleurs.danger,
    fontSize: 14,
    marginBottom: espacements.lg,
    lineHeight: 20,
  },
  info: {
    fontSize: 13,
    color: couleurs.texteSecondaire,
    lineHeight: 19,
    marginBottom: espacements.lg,
  },
  actions: { marginTop: espacements.sm },
  annuler: { marginTop: espacements.md },
});
