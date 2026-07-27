import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import StudentsListScreen from './src/screens/StudentsListScreen';
import StudentFormScreen from './src/screens/StudentFormScreen';
import SubjectsListScreen from './src/screens/SubjectsListScreen';
import SubjectFormScreen from './src/screens/SubjectFormScreen';
import ScoresListScreen from './src/screens/ScoresListScreen';
import ScoreFormScreen from './src/screens/ScoreFormScreen';
import RelevesListScreen from './src/screens/RelevesListScreen';
import ReleveScreen from './src/screens/ReleveScreen';
import { couleurs } from './src/theme';

/* ------------------------------------------------------------------------
 * POINT D'ENTREE DE L'APPLICATION
 * ------------------------------------------------------------------------
 * Navigation geree par react-navigation en mode "stack" (pile), comme vu au
 * chapitre 5 du cours :
 *
 *   - NavigationContainer    : englobe toute l'application et gere l'etat de la
 *                              navigation. Il doit etre l'element racine, une
 *                              seule fois dans l'application.
 *   - createStackNavigator() : cree la pile. Chaque <Stack.Screen> declare un
 *                              ecran atteignable par son `name`.
 *
 * Principe de la pile : navigation.navigate('NomEcran') empile un ecran par
 * dessus le precedent, et la fleche de retour de l'en-tete le depile. Chaque
 * ecran recoit automatiquement les props `navigation` et `route`.
 *
 * Un ecran liste + un ecran formulaire par entite, le formulaire servant a la
 * fois a la creation et a la modification (distinguees par les parametres de
 * navigation passes dans `route.params`).
 * ---------------------------------------------------------------------- */

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Accueil"
          // Options communes a tous les ecrans : evite de repeter la mise en
          // forme de l'en-tete sur chaque <Stack.Screen>.
          screenOptions={{
            headerStyle: { backgroundColor: couleurs.primaire },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          {/* Pas de barre de navigation sur l'accueil : le logo en tient lieu
              d'en-tete. L'ecran gere lui-meme la zone sure (encoche, barre
              d'etat) via SafeAreaView. */}
          <Stack.Screen
            name="Accueil"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          {/* --- Etudiants --- */}
          <Stack.Screen
            name="EtudiantsListe"
            component={StudentsListScreen}
            options={{ title: 'Etudiants' }}
          />
          {/* Pas de `title` ici : le formulaire pose lui-meme son titre selon
              qu'il est en mode creation ou modification. */}
          <Stack.Screen name="EtudiantFormulaire" component={StudentFormScreen} />

          {/* --- Matieres --- */}
          <Stack.Screen
            name="MatieresListe"
            component={SubjectsListScreen}
            options={{ title: 'Matieres' }}
          />
          <Stack.Screen name="MatiereFormulaire" component={SubjectFormScreen} />

          {/* --- Notes --- */}
          <Stack.Screen
            name="NotesListe"
            component={ScoresListScreen}
            options={{ title: 'Notes' }}
          />
          <Stack.Screen name="NoteFormulaire" component={ScoreFormScreen} />

          {/* --- Relevés --- */}
          <Stack.Screen
            name="RelevesListe"
            component={RelevesListScreen}
            options={{ title: 'Relevés de notes' }}
          />
          <Stack.Screen name="Releve" component={ReleveScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
