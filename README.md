# gestion-scolaire-isga

Application mobile **React Native (Expo)** de gestion scolaire — Étudiants, Matières et Notes —
consommant une API REST, avec génération du relevé de notes en PDF.

Projet réalisé dans le cadre du cours React Native (M. Chougdali).

---

## Architecture

Le projet se compose de deux parties **volontairement séparées** :

| Dossier | Contenu | Dépôt |
|---|---|---|
| `mobile/` | L'application React Native / Expo — **le livrable de ce dépôt** | ce dépôt |
| `backend/` | L'API REST fournie par Mr EnnachatRedwan | [EnnachatRedwan/scholar-rest-soap](https://github.com/EnnachatRedwan/scholar-rest-soap) |

> `backend/` est **ignoré par git** (voir `.gitignore`) : c'est le dépôt de Mr EnnachatRedwan, il garde son
> propre historique et n'est pas modifié. Ce dépôt ne contient que le travail personnel.

---

## Partie 1 — Démarrer le backend

### Stack réelle

Malgré son nom, `scholar-rest-soap` n'est **pas** un projet Spring Boot :

- **Java 17** / **Jakarta EE 10** — JAX-RS (REST) + JAX-WS (SOAP) + CDI
- **JDBC pur** — DAO écrits à la main, pas de JPA/Hibernate
- Déployé en `.war` sur **WildFly 37**
- Base **MySQL / MariaDB**

Il n'y a donc pas de `application.properties` : la configuration de la base vit dans le
`standalone.xml` de WildFly.

### Prérequis

- JDK 17+ · Maven 3.8+ · MySQL 8 ou MariaDB · WildFly 27+

### Procédure

```bash
# 1. Récupérer l'API
git clone https://github.com/EnnachatRedwan/scholar-rest-soap.git backend

# 2. Créer la base (les tables et les données d'exemple sont créées automatiquement
#    au démarrage par DataInitializer — aucun import SQL nécessaire)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS school_db;"

# 3. Compiler et déployer
cd backend
mvn clean package
cp target/school-rest-jax-rs.war $WILDFLY_HOME/standalone/deployments/

# 4. Démarrer
$WILDFLY_HOME/bin/standalone.bat
```

### ⚠️ Deux correctifs indispensables

Le dépôt tel quel **ne démarre pas**. Deux problèmes hors dépôt, à corriger dans WildFly :

**1. Mot de passe de datasource vide** — WildFly 37 refuse de *parser* sa configuration si
`password=""` (`WFLYCTL0113: '' is an invalid value for parameter password`). Le serveur meurt au
boot. Comme le `root` de XAMPP n'a pas de mot de passe, on crée un utilisateur dédié :

```sql
CREATE USER IF NOT EXISTS 'school'@'localhost' IDENTIFIED BY '<mot_de_passe>';
GRANT ALL PRIVILEGES ON school_db.* TO 'school'@'localhost';
FLUSH PRIVILEGES;
```

puis dans `$WILDFLY_HOME/standalone/configuration/standalone.xml`, datasource `schoolDS` :

```xml
<security user-name="school" password="<mot_de_passe>"/>
```

Le mot de passe doit être non vide — c'est précisément la contrainte de WildFly 37 décrite
ci-dessus. Il n'est pas versionné ici : il ne vit que dans le `standalone.xml` de ta machine.

**2. Module MySQL incomplet** — sans `java.security.sasl`, le driver lève
`NoClassDefFoundError: javax/security/sasl/SaslException` à chaque connexion : le serveur démarre
mais le déploiement du WAR échoue. Dans
`$WILDFLY_HOME/modules/com/mysql/main/module.xml`, ajouter la dépendance :

```xml
<dependencies>
    <module name="java.sql"/>
    <module name="java.management"/>
    <module name="java.naming"/>
    <module name="java.security.jgss"/>
    <module name="java.security.sasl"/>   <!-- ← manquant -->
    <module name="java.transaction.xa"/>
</dependencies>
```

Un changement de module exige un **redémarrage** de WildFly.

### Accès depuis un téléphone

Par défaut WildFly n'écoute que sur `127.0.0.1` : un téléphone du réseau local **ne peut pas**
joindre l'API. Pour les tests sur appareil réel, démarrer avec :

```bash
standalone.bat -b 0.0.0.0
```

C'est un simple argument de démarrage, réversible : sans le flag, retour à `127.0.0.1`.
Récupérer l'IP LAN de la machine avec `ipconfig` (Windows) — c'est celle qu'affiche aussi Metro.

---

## API REST

Base : `http://localhost:8080/school-rest-jax-rs/api`

Chaque entité expose le CRUD complet :

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/students` · `/subjects` · `/scores` | Liste |
| GET | `/{entité}/{id}` | Détail |
| POST | `/{entité}` | Création → `201` |
| PUT | `/{entité}/{id}` | Modification |
| DELETE | `/{entité}/{id}` | Suppression |

Deux filtres supplémentaires, utiles pour le relevé :

| GET | `/scores/student/{studentId}` | Toutes les notes d'un étudiant |
|---|---|---|
| GET | `/scores/subject/{subjectId}` | Toutes les notes d'une matière |

### Formats JSON

```json
// Étudiant
{ "id": 1, "firstName": "John", "lastName": "Doe",
  "email": "john.doe@example.com", "dateOfBirth": "2000-01-15" }

// Matière — `credits` sert de coefficient
{ "id": 1, "name": "Mathematics", "code": "MATH101",
  "description": "Introduction to Mathematics", "credits": 3 }

// Note — rattachée à un étudiant ET une matière
{ "id": 1, "studentId": 1, "subjectId": 1, "score": 85.5,
  "examDate": "2026-01-15", "examType": "MIDTERM" }
```

Codes : `200` succès · `201` création · `400` champs requis manquants · `404` introuvable.

### Particularités du modèle à connaître

- **`credits` = coefficient.** Il n'existe pas de champ `coefficient` ; on utilise `credits`.
- **Aucune clé étrangère sur `scores`.** Rien n'empêche de créer une note pour un `studentId`
  inexistant, et supprimer un étudiant laisse ses notes orphelines. La validation doit donc se
  faire côté client, via des listes de sélection alimentées par l'API.
- **Plusieurs notes possibles par matière** (`examType` : `MIDTERM`, `FINAL`…).
- Les dates sont des `VARCHAR(20)`, pas des `DATE`.

---

## Partie 2 — Application mobile

### Démarrage

```bash
cd mobile
npm install
npm start          # puis scanner le QR code avec Expo Go
npm run web        # ou lancer dans le navigateur
npm run android    # ou sur un émulateur Android
```

**Expo SDK 54** — Expo Go n'accepte que les deux ou trois derniers SDK. Si l'application
affiche « Project is incompatible with this version of Expo Go », mettre Expo Go à jour depuis
le store.

### ⚠️ Configurer l'adresse du backend

Tout passe par une **instance axios unique** dans [`mobile/src/api/client.js`](mobile/src/api/client.js),
seul fichier à modifier si l'adresse change :

```js
const HOST_LAN = '192.168.100.2'; // ← l'IP de la machine qui fait tourner WildFly
const HOST = Platform.OS === 'web' ? 'localhost' : HOST_LAN;
```

L'hôte dépend de la plateforme, et ce n'est pas un détail : dans un navigateur le code s'exécute
sur la machine de développement, donc `localhost` désigne bien WildFly ; sur un téléphone il
s'exécute sur **l'appareil**, où `localhost` désigne le téléphone lui-même.

Trouver l'IP LAN : `ipconfig` sous Windows, ligne « Adresse IPv4 » de la carte Wi-Fi. C'est aussi
celle qu'affiche Metro au démarrage.

Côté serveur, démarrer WildFly avec `standalone.bat -b 0.0.0.0` (voir plus haut), et vérifier que
le pare-feu autorise les ports **8080** et **8081**. Sous Windows, une règle bloquant `node.exe`
prend le pas sur une règle autorisant le port : la vérifier si Metro reste injoignable.

### Structure

```
mobile/src/
├── api/          client.js (instance axios) + un service par entité
├── components/   Bouton · ChampTexte · Selecteur · CarteListe · Loader
├── screens/      Accueil · 3 × (Liste + Formulaire) · Relevés · Relevé
├── utils/        releve.js (calcul) · pdfReleve.js (HTML) · dialogues.js
└── theme.js      palette et espacements
```

Un écran liste et un écran formulaire par entité, ce dernier servant à la création comme à la
modification, distinguées par les paramètres de navigation. Navigation en pile avec
`react-navigation`, styles en `StyleSheet` et Flexbox, listes en `FlatList`.

### Relations entre entités

Une note est rattachée à un étudiant **et** à une matière via des listes de sélection alimentées
par l'API, jamais par saisie libre d'identifiant — la table `scores` n'ayant aucune clé étrangère,
la cohérence ne peut être garantie que côté client.

### Calcul de la moyenne du relevé

- **Notes sur 20.** Le backend stocke un `DOUBLE` sans borne : c'est l'application qui valide la
  plage 0–20 à la saisie.
- Moyenne des différents examens d'une matière, **puis** moyenne pondérée par `credits` :
  `Σ(moyenne_matière × credits) / Σ(credits)`
- Mentions au barème français : ≥16 Très bien · ≥14 Bien · ≥12 Assez bien · ≥10 Passable.
- Le bouton **« Télécharger le relevé »** ne s'active que lorsque l'étudiant a au moins une note
  dans **chaque** matière ; sinon il reste désactivé et les matières manquantes sont affichées.

### Relevé PDF

Généré par `expo-print` à partir d'un HTML construit dans
[`pdfReleve.js`](mobile/src/utils/pdfReleve.js), puis partagé via `expo-sharing`. Le document est
mis en page pour l'impression : format A4, en-tête institutionnel avec le logo, tableau
matière / coefficient / note, moyenne et mention, zone de signature, coordonnées de
l'établissement en pied de page.

Le logo est embarqué en base64 ([`logoIsga.js`](mobile/src/utils/logoIsga.js)) : `expo-print` rend
le HTML hors du bundle de l'application, une balise `<img>` pointant vers `./assets/` n'y
résoudrait rien.

Sur navigateur, `printToFileAsync` n'existe pas — on bascule sur `printAsync`, qui ouvre la boîte
d'impression et son option « Enregistrer au format PDF ».

### Identité visuelle

La palette de [`theme.js`](mobile/src/theme.js) reprend les couleurs de l'établissement : rouge
`#D91D36` et gris `#5E5E5D`, échantillonnés directement dans les pixels du logo. Aucun code
couleur n'est écrit ailleurs que dans ce fichier.

### Périmètre technique

Le projet se limite aux notions du cours : composants fonctionnels, `View` / `Text` /
`StyleSheet` / Flexbox / `FlatList` / `Image` / `TextInput`, State et Props, `react-navigation`
(`NavigationContainer` + `createStackNavigator`), et **axios** avec `async/await`.

Axios plutôt que `fetch` parce qu'il analyse le JSON automatiquement et lève une erreur sur les
statuts non-2xx, là où `fetch` considère un 404 comme un succès — la gestion d'erreurs en
`try/catch` en devient bien plus fiable.

Seule exception au périmètre : `expo-print` et `expo-sharing` pour l'export PDF. Ni Redux ni
TypeScript.
