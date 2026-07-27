import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { couleurs, espacements, rayon } from '../theme';

/* Menu d'accueil : point d'entree vers les trois entites et vers les relevés.
 *
 * `navigation` est une prop injectee automatiquement par react-navigation dans
 * tout ecran declare dans le Stack. `navigation.navigate('NomEcran')` empile
 * l'ecran demande, et la fleche de retour de l'en-tete depile.
 */

const ENTREES = [
  {
    ecran: 'EtudiantsListe',
    titre: 'Etudiants',
    description: 'Ajouter, modifier et supprimer des etudiants',
    icone: '👨‍🎓',
  },
  {
    ecran: 'MatieresListe',
    titre: 'Matieres',
    description: 'Gerer les matieres et leurs coefficients',
    icone: '📚',
  },
  {
    ecran: 'NotesListe',
    titre: 'Notes',
    description: 'Saisir les notes par etudiant et par matiere',
    icone: '📝',
  },
  {
    ecran: 'RelevesListe',
    titre: 'Relevés de notes',
    description: 'Consulter la moyenne et telecharger le relevé en PDF',
    icone: '📄',
  },
];

export default function HomeScreen({ navigation }) {
  return (
    // Cet ecran n'a pas de barre de navigation : SafeAreaView decale son
    // contenu sous l'encoche et la barre d'etat, sinon le logo passerait
    // dessous. `edges={['top']}` limite la marge au haut de l'ecran.
    <SafeAreaView style={styles.ecran} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        {/* Le logo remplace le titre textuel. resizeMode="contain" preserve
            les proportions quelle que soit la largeur de l'ecran. */}
        <Image
          source={require('../../assets/isga-logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="ISGA"
        />

        {ENTREES.map((entree) => (
          <TouchableOpacity
            key={entree.ecran}
            style={styles.carte}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(entree.ecran)}
          >
            <Text style={styles.icone}>{entree.icone}</Text>
            <View style={styles.zoneTexte}>
              <Text style={styles.carteTitre}>{entree.titre}</Text>
              <Text style={styles.carteDescription}>{entree.description}</Text>
            </View>
            <Text style={styles.fleche}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: espacements.lg },
  // alignSelf: 'center' centre le logo horizontalement, sans avoir a envelopper
  // l'image dans une View supplementaire.
  logo: {
    width: '62%',
    height: 92,
    alignSelf: 'center',
    marginTop: espacements.sm,
    marginBottom: espacements.xl,
  },
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
  icone: { fontSize: 28, marginRight: espacements.lg },
  zoneTexte: { flex: 1 },
  carteTitre: { fontSize: 17, fontWeight: '700', color: couleurs.texte },
  carteDescription: {
    fontSize: 13,
    color: couleurs.texteSecondaire,
    marginTop: 2,
  },
  fleche: { fontSize: 26, color: couleurs.texteSecondaire },
});
