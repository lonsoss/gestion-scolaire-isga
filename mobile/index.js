// Doit rester la TOUTE PREMIERE ligne du point d'entree : react-navigation en
// mode stack s'appuie sur react-native-gesture-handler pour les gestes de
// retour, et cette bibliotheque doit etre chargee avant tout composant.
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
