import { useCallback, useLayoutEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { getScoresByStudent } from '../api/scores';
import { getStudent } from '../api/students';
import { getSubjects } from '../api/subjects';
import { messageErreur } from '../api/client';
import Bouton from '../components/Bouton';
import Loader from '../components/Loader';
import { construireReleve, formaterNote, mention, NOTE_MAX } from '../utils/releve';
import { construireHtmlReleve } from '../utils/pdfReleve';
import { alerter } from '../utils/dialogues';
import { couleurs, espacements, rayon } from '../theme';

/* ------------------------------------------------------------------------
 * ECRAN RELEVE DE NOTES
 * ------------------------------------------------------------------------
 * Affiche toutes les notes d'un etudiant matiere par matiere, calcule sa
 * moyenne ponderee, et permet de telecharger le relevé en PDF.
 *
 * Le bouton "Telecharger le relevé" n'est ACTIF que si l'etudiant a au moins
 * une note dans CHAQUE matiere. Sinon il reste desactive et la liste des
 * matieres manquantes est affichee.
 * ---------------------------------------------------------------------- */
export default function ReleveScreen({ navigation, route }) {
  const { studentId, nom } = route.params;

  const [etudiant, setEtudiant] = useState(null);
  const [matieres, setMatieres] = useState([]);
  const [notes, setNotes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [generation, setGeneration] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: nom ? `Relevé — ${nom}` : 'Relevé' });
  }, [navigation, nom]);

  const charger = useCallback(async () => {
    try {
      setErreur(null);
      setChargement(true);
      // Trois requetes independantes -> en parallele
      const [donneesEtudiant, listeMatieres, listeNotes] = await Promise.all([
        getStudent(studentId),
        getSubjects(),
        getScoresByStudent(studentId),
      ]);
      setEtudiant(donneesEtudiant);
      setMatieres(listeMatieres);
      setNotes(listeNotes);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, [studentId]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  // Tout le calcul est delegue au module utils/releve.js : l'ecran ne fait
  // qu'afficher son resultat. On le calcule avant les retours anticipes pour
  // que telecharger() dispose toujours de valeurs definies.
  const { lignes, matieresManquantes, complet, moyenneGenerale } = construireReleve(
    matieres,
    notes
  );

  async function telecharger() {
    if (!etudiant || !complet) return;

    try {
      setGeneration(true);

      const html = construireHtmlReleve({
        etudiant,
        lignes,
        moyenneGenerale,
        dateEdition: new Date().toLocaleDateString('fr-FR'),
      });

      if (Platform.OS === 'web') {
        // Sur navigateur, printToFileAsync n'existe pas : on ouvre la boite
        // d'impression, qui propose "Enregistrer au format PDF".
        await Print.printAsync({ html });
        return;
      }

      // 1. expo-print transforme le HTML en fichier PDF et renvoie son chemin
      const { uri } = await Print.printToFileAsync({ html });

      // 2. expo-sharing ouvre la feuille de partage du systeme, qui permet
      //    d'enregistrer le fichier ou de l'envoyer a une autre application.
      const partagePossible = await Sharing.isAvailableAsync();
      if (partagePossible) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Relevé de ${nom}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        alerter('PDF genere', `Le partage n'est pas disponible ici.\n\nFichier : ${uri}`);
      }
    } catch (e) {
      alerter('Erreur', `Impossible de generer le PDF.\n\n${e.message}`);
    } finally {
      setGeneration(false);
    }
  }

  if (chargement) return <Loader texte="Calcul du relevé..." />;

  if (erreur) {
    return (
      <View style={styles.centre}>
        <Text style={styles.texteErreur}>{erreur}</Text>
        <Bouton titre="Reessayer" onPress={charger} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <View style={styles.identite}>
        <Text style={styles.nom}>
          {etudiant ? `${etudiant.firstName} ${etudiant.lastName}` : nom}
        </Text>
        {etudiant && etudiant.email ? (
          <Text style={styles.email}>{etudiant.email}</Text>
        ) : null}
      </View>

      {/* En-tete du tableau */}
      <View style={[styles.ligne, styles.enTete]}>
        <Text style={[styles.celluleMatiere, styles.texteEnTete]}>Matiere</Text>
        <Text style={[styles.celluleCoef, styles.texteEnTete]}>Coef</Text>
        <Text style={[styles.celluleNote, styles.texteEnTete]}>Note</Text>
      </View>

      {lignes.length === 0 ? (
        <Text style={styles.vide}>
          Aucune matiere n'existe encore. Il faut en creer avant de pouvoir
          etablir un relevé.
        </Text>
      ) : null}

      {lignes.map((ligne) => (
        <View key={String(ligne.subject.id)} style={styles.ligne}>
          <View style={styles.celluleMatiere}>
            <Text style={styles.nomMatiere}>{ligne.subject.name}</Text>
            <Text style={styles.codeMatiere}>{ligne.subject.code}</Text>
            {/* Detail des examens quand il y en a plusieurs dans la matiere */}
            {ligne.notes.length > 1 ? (
              <Text style={styles.detailExamens}>
                {ligne.notes
                  .map((n) => `${n.examType || 'Examen'} : ${formaterNote(n.score)}`)
                  .join(' · ')}
              </Text>
            ) : null}
          </View>
          <Text style={styles.celluleCoef}>{ligne.coef}</Text>
          <Text
            style={[
              styles.celluleNote,
              ligne.moyenneMatiere === null ? styles.noteManquante : styles.noteOk,
            ]}
          >
            {ligne.moyenneMatiere === null
              ? 'manquante'
              : formaterNote(ligne.moyenneMatiere)}
          </Text>
        </View>
      ))}

      {/* Bilan : affiche uniquement quand le relevé est complet */}
      {complet ? (
        <View style={styles.bilan}>
          <View style={styles.bilanTexte}>
            <Text style={styles.bilanLibelle}>Moyenne generale ponderee</Text>
            <Text style={styles.bilanMention}>Mention : {mention(moyenneGenerale)}</Text>
          </View>
          <Text style={styles.bilanValeur}>
            {formaterNote(moyenneGenerale)}
            <Text style={styles.bilanMax}> / {NOTE_MAX}</Text>
          </Text>
        </View>
      ) : (
        <View style={styles.avertissement}>
          <Text style={styles.avertissementTitre}>Relevé incomplet</Text>
          <Text style={styles.avertissementTexte}>
            {lignes.length === 0
              ? "Aucune matiere n'est enregistree."
              : `La moyenne ne peut pas etre calculee : il manque une note dans ${
                  matieresManquantes.length > 1 ? 'les matieres' : 'la matiere'
                } ${matieresManquantes.join(', ')}.`}
          </Text>
        </View>
      )}

      <Bouton
        titre="Telecharger le relevé (PDF)"
        onPress={telecharger}
        // Desactive tant que l'etudiant n'a pas une note dans chaque matiere
        desactive={!complet}
        enChargement={generation}
        style={styles.boutonPdf}
      />

      <Text style={styles.methode}>
        Methode : la moyenne d'une matiere est la moyenne de ses examens ; la
        moyenne generale pondere ces moyennes par les coefficients (le champ
        `credits` des matieres).
      </Text>
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

  identite: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espacements.lg,
    marginBottom: espacements.lg,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  nom: { fontSize: 19, fontWeight: '800', color: couleurs.texte },
  email: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2 },

  // Le tableau est construit en Flexbox : chaque ligne est une row, et les
  // largeurs des colonnes sont fixees par flex / width.
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.carte,
    paddingVertical: espacements.md,
    paddingHorizontal: espacements.md,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.bordure,
  },
  enTete: {
    backgroundColor: couleurs.primaire,
    borderTopLeftRadius: rayon,
    borderTopRightRadius: rayon,
  },
  texteEnTete: { color: '#fff', fontWeight: '700', fontSize: 13 },
  celluleMatiere: { flex: 1 },
  celluleCoef: { width: 50, textAlign: 'center', color: couleurs.texte },
  celluleNote: { width: 90, textAlign: 'right', fontWeight: '700' },
  nomMatiere: { fontSize: 15, fontWeight: '600', color: couleurs.texte },
  codeMatiere: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 1 },
  detailExamens: {
    fontSize: 11,
    color: couleurs.texteSecondaire,
    marginTop: 4,
    fontStyle: 'italic',
  },
  noteOk: { color: couleurs.texte },
  noteManquante: { color: couleurs.danger, fontWeight: '600', fontSize: 12 },
  vide: {
    backgroundColor: couleurs.carte,
    padding: espacements.lg,
    color: couleurs.texteSecondaire,
    lineHeight: 20,
  },

  bilan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: couleurs.primaireClair,
    borderWidth: 1,
    borderColor: couleurs.primaireBordure,
    borderRadius: rayon,
    padding: espacements.lg,
    marginTop: espacements.lg,
  },
  bilanTexte: { flex: 1 },
  bilanLibelle: { fontSize: 14, fontWeight: '700', color: couleurs.primaireFonce },
  bilanMention: { fontSize: 13, color: couleurs.primaireFonce, marginTop: 2 },
  bilanValeur: { fontSize: 26, fontWeight: '800', color: couleurs.primaireFonce },
  bilanMax: { fontSize: 14, fontWeight: '600' },

  avertissement: {
    backgroundColor: couleurs.alerteFond,
    borderWidth: 1,
    borderColor: couleurs.alerteBordure,
    borderRadius: rayon,
    padding: espacements.lg,
    marginTop: espacements.lg,
  },
  avertissementTitre: {
    fontSize: 15,
    fontWeight: '700',
    color: couleurs.alerteTexte,
    marginBottom: espacements.xs,
  },
  avertissementTexte: { fontSize: 14, color: couleurs.alerteTexte, lineHeight: 20 },

  boutonPdf: { marginTop: espacements.lg },
  methode: {
    fontSize: 12,
    color: couleurs.texteSecondaire,
    lineHeight: 18,
    marginTop: espacements.md,
  },
});
