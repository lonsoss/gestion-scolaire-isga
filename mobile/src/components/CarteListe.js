import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { couleurs, espacements, rayon } from '../theme';

/**
 * Ligne generique des FlatList : un titre, un sous-titre, un detail, une valeur
 * mise en avant a droite, et deux actions (Modifier / Supprimer).
 *
 * Factoriser cette ligne evite de reecrire la meme mise en page dans les trois
 * ecrans de liste (Etudiants, Matieres, Notes) : c'est tout l'interet d'un
 * composant reutilisable pilote par ses props (les props sont immutables, la
 * carte ne fait qu'afficher ce que l'ecran parent lui transmet).
 */
export default function CarteListe({
  titre,
  sousTitre,
  detail,
  valeur,
  onModifier,
  onSupprimer,
  onPress,
}) {
  // Si aucun onPress n'est fourni, la carte entiere n'est pas cliquable :
  // on utilise alors une simple View pour ne pas simuler un faux retour visuel.
  const Conteneur = onPress ? TouchableOpacity : View;

  return (
    <Conteneur
      style={styles.carte}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.ligneHaut}>
        <View style={styles.zoneTexte}>
          <Text style={styles.titre}>{titre}</Text>
          {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>

        {valeur !== undefined && valeur !== null ? (
          <View style={styles.badge}>
            <Text style={styles.badgeTexte}>{valeur}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={onModifier} activeOpacity={0.6}>
          <Text style={styles.actionTexte}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={onSupprimer} activeOpacity={0.6}>
          <Text style={[styles.actionTexte, styles.actionDanger]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </Conteneur>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espacements.lg,
    marginBottom: espacements.md,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  // flexDirection: 'row' -> le texte a gauche, le badge a droite
  ligneHaut: { flexDirection: 'row', alignItems: 'flex-start' },
  // flex: 1 -> la zone de texte occupe toute la place restante, le texte passe
  // a la ligne au lieu de pousser le badge hors de l'ecran
  zoneTexte: { flex: 1 },
  titre: { fontSize: 16, fontWeight: '700', color: couleurs.texte },
  sousTitre: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: 2 },
  detail: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 4 },
  badge: {
    backgroundColor: couleurs.primaireClair,
    borderRadius: 8,
    paddingHorizontal: espacements.md,
    paddingVertical: espacements.xs,
    marginLeft: espacements.sm,
  },
  badgeTexte: { color: couleurs.primaire, fontWeight: '700', fontSize: 15 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: espacements.md,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
    paddingTop: espacements.sm,
  },
  action: {
    paddingVertical: espacements.xs,
    paddingHorizontal: espacements.md,
    borderRadius: 6,
  },
  actionTexte: { fontSize: 14, fontWeight: '600', color: couleurs.primaire },
  actionDanger: { color: couleurs.danger },
});
