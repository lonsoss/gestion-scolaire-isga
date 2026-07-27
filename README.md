# scholar-app

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

> En cours de développement.

### Calcul de la moyenne du relevé

- **Notes sur 20.** Le backend stocke un `DOUBLE` sans borne : c'est l'application qui valide la
  plage 0–20 à la saisie. Attention, `DataInitializer` insère des notes d'exemple sur 100
  (85.5 et 92.0) quand la base est vide — elles réapparaîtront à chaque réinitialisation et sont
  à corriger.
- Moyenne des différents examens d'une matière, **puis** moyenne pondérée par `credits` :
  `Σ(moyenne_matière × credits) / Σ(credits)`
- Mentions au barème français : ≥16 Très bien · ≥14 Bien · ≥12 Assez bien · ≥10 Passable.
- Le bouton **« Télécharger le relevé »** ne s'active que lorsque l'étudiant a au moins une note
  dans **chaque** matière ; sinon il reste désactivé et les matières manquantes sont affichées.
- Export PDF via `expo-print`, puis partage/enregistrement via `expo-sharing`.
