import { useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { createStudent, updateStudent } from '../api/students';
import { messageErreur } from '../api/client';
import Bouton from '../components/Bouton';
import ChampTexte from '../components/ChampTexte';
import { alerter } from '../utils/dialogues';
import { couleurs, espacements } from '../theme';

/* Ecran FORMULAIRE des etudiants — sert a la CREATION et a la MODIFICATION.
 *
 * Un seul ecran pour les deux operations : on regarde si un etudiant a ete
 * passe en parametre de navigation (`route.params.etudiant`).
 *   - absent  -> mode creation (POST)
 *   - present -> mode edition, les champs sont pre-remplis (PUT)
 *
 * Les valeurs des champs sont stockees dans le State et injectees dans les
 * TextInput : ce sont des composants "controles".
 */
export default function StudentFormScreen({ navigation, route }) {
  const etudiant = route.params && route.params.etudiant;
  const modeEdition = Boolean(etudiant);

  const [firstName, setFirstName] = useState(etudiant ? etudiant.firstName : '');
  const [lastName, setLastName] = useState(etudiant ? etudiant.lastName : '');
  const [email, setEmail] = useState(etudiant ? etudiant.email || '' : '');
  const [dateOfBirth, setDateOfBirth] = useState(
    etudiant ? etudiant.dateOfBirth || '' : ''
  );

  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  // Titre de l'en-tete adapte au mode. useLayoutEffect plutot que useEffect
  // pour que le titre soit pose avant le premier affichage (pas de clignotement).
  useLayoutEffect(() => {
    navigation.setOptions({
      title: modeEdition ? 'Modifier l\'etudiant' : 'Nouvel etudiant',
    });
  }, [navigation, modeEdition]);

  /** Validation cote client, avant tout appel reseau. */
  function valider() {
    const nouvelles = {};
    if (!firstName.trim()) nouvelles.firstName = 'Le prenom est obligatoire.';
    if (!lastName.trim()) nouvelles.lastName = 'Le nom est obligatoire.';
    // Le backend refuse la creation sans firstName/lastName (400), on evite
    // donc l'aller-retour reseau inutile.
    if (email.trim() && !email.includes('@')) {
      nouvelles.email = 'Adresse email invalide.';
    }
    if (dateOfBirth.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      nouvelles.dateOfBirth = 'Format attendu : AAAA-MM-JJ (ex. 2000-01-15).';
    }
    setErreurs(nouvelles);
    return Object.keys(nouvelles).length === 0;
  }

  async function enregistrer() {
    if (!valider()) return;

    const donnees = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      dateOfBirth: dateOfBirth.trim(),
    };

    try {
      setEnvoi(true);
      if (modeEdition) {
        await updateStudent(etudiant.id, donnees);
      } else {
        await createStudent(donnees);
      }
      // On revient a la liste : son useFocusEffect la rechargera toute seule.
      navigation.goBack();
    } catch (e) {
      alerter('Erreur', messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <ChampTexte
        label="Prenom *"
        valeur={firstName}
        onChangeText={setFirstName}
        placeholder="John"
        erreur={erreurs.firstName}
      />
      <ChampTexte
        label="Nom *"
        valeur={lastName}
        onChangeText={setLastName}
        placeholder="Doe"
        erreur={erreurs.lastName}
      />
      <ChampTexte
        label="Email"
        valeur={email}
        onChangeText={setEmail}
        placeholder="john.doe@example.com"
        clavier="email-address"
        erreur={erreurs.email}
      />
      <ChampTexte
        label="Date de naissance"
        valeur={dateOfBirth}
        onChangeText={setDateOfBirth}
        placeholder="2000-01-15"
        erreur={erreurs.dateOfBirth}
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
