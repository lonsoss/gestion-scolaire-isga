/* ------------------------------------------------------------------------
 * IDENTITE VISUELLE
 * ------------------------------------------------------------------------
 * La palette reprend les couleurs de l'ISGA. Le rouge et le gris ne sont pas
 * choisis a l'oeil : le PNG du logo a ete decode et ce sont les deux teintes
 * majoritaires de ses pixels opaques (respectivement 17 712 et 20 769 pixels).
 *
 * Regrouper ces valeurs ici evite de repeter des codes couleur dans chaque
 * StyleSheet : un seul fichier a modifier pour changer l'apparence de toute
 * l'application.
 * ---------------------------------------------------------------------- */

export const couleurs = {
  // Couleurs de marque
  primaire: '#D91D36', // rouge ISGA
  primaireFonce: '#A81529',
  primaireClair: '#FDECEF', // fond teinte, pour les badges et surfaces mises en avant
  primaireBordure: '#F5C2CB',

  secondaire: '#5E5E5D', // gris ISGA

  // Etats
  danger: '#B91C1C',
  dangerFond: '#FEF2F2',
  dangerBordure: '#FECACA',
  succes: '#15803D',
  alerteFond: '#FFFBEB',
  alerteBordure: '#FDE68A',
  alerteTexte: '#92400E',

  // Surfaces et texte
  fond: '#F5F5F4',
  carte: '#FFFFFF',
  bordure: '#E3E3E1',
  texte: '#1F1F1E',
  texteSecondaire: '#6B6B69',
  desactive: '#CFCFCC',
};

export const espacements = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const rayon = 10;
