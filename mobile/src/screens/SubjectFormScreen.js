import { useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { createSubject, updateSubject } from '../api/subjects';
import { messageErreur } from '../api/client';
import Bouton from '../components/Bouton';
import ChampTexte from '../components/ChampTexte';
import { alerter } from '../utils/dialogues';
import { couleurs, espacements } from '../theme';

/* Ecran FORMULAIRE des matieres — creation et modification.
 * Le champ `credits` est saisi au clavier numerique et converti en nombre
 * avant l'envoi : le backend attend un entier, pas une chaine.
 */
export default function SubjectFormScreen({ navigation, route }) {
  const matiere = route.params && route.params.matiere;
  const modeEdition = Boolean(matiere);

  const [name, setName] = useState(matiere ? matiere.name : '');
  const [code, setCode] = useState(matiere ? matiere.code : '');
  const [description, setDescription] = useState(
    matiere ? matiere.description || '' : ''
  );
  const [credits, setCredits] = useState(
    matiere && matiere.credits !== null && matiere.credits !== undefined
      ? String(matiere.credits)
      : ''
  );

  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: modeEdition ? 'Modifier la matiere' : 'Nouvelle matiere',
    });
  }, [navigation, modeEdition]);

  function valider() {
    const nouvelles = {};
    if (!name.trim()) nouvelles.name = 'Le nom est obligatoire.';
    if (!code.trim()) nouvelles.code = 'Le code est obligatoire.';

    const nbCredits = Number(credits);
    if (!credits.trim()) {
      nouvelles.credits = 'Le coefficient est obligatoire.';
    } else if (!Number.isInteger(nbCredits) || nbCredits <= 0) {
      nouvelles.credits = 'Le coefficient doit etre un entier superieur a 0.';
    }

    setErreurs(nouvelles);
    return Object.keys(nouvelles).length === 0;
  }

  async function enregistrer() {
    if (!valider()) return;

    const donnees = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      credits: Number(credits),
    };

    try {
      setEnvoi(true);
      if (modeEdition) {
        await updateSubject(matiere.id, donnees);
      } else {
        await createSubject(donnees);
      }
      navigation.goBack();
    } catch (e) {
      // Le code de la matiere est UNIQUE en base : un doublon renverra une
      // erreur serveur, que messageErreur() rendra lisible.
      alerter('Erreur', messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <ChampTexte
        label="Nom *"
        valeur={name}
        onChangeText={setName}
        placeholder="Mathematiques"
        erreur={erreurs.name}
      />
      <ChampTexte
        label="Code *"
        valeur={code}
        onChangeText={setCode}
        placeholder="MATH101"
        erreur={erreurs.code}
      />
      <ChampTexte
        label="Coefficient (credits) *"
        valeur={credits}
        onChangeText={setCredits}
        placeholder="3"
        clavier="numeric"
        erreur={erreurs.credits}
      />
      <ChampTexte
        label="Description"
        valeur={description}
        onChangeText={setDescription}
        placeholder="Introduction aux mathematiques"
        multiligne
      />

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
  actions: { marginTop: espacements.sm },
  annuler: { marginTop: espacements.md },
});
