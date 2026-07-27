import { formaterNote, mention, NOTE_MAX } from './releve';
import { LOGO_ISGA } from './logoIsga';
import { ETABLISSEMENT } from './etablissement';

/* Rouge d'accent du document, echantillonne directement dans le logo :
 * c'est la teinte majoritaire de ses pixels rouges opaques. */
const COULEUR_ISGA = '#D91D36';

/* ------------------------------------------------------------------------
 * GENERATION DU HTML DU RELEVE
 * ------------------------------------------------------------------------
 * expo-print transforme une chaine HTML en PDF. On construit donc ici le
 * document, avec un vrai tableau matiere / coef / note, la moyenne generale et
 * la mention.
 *
 * Le style est en CSS classique (et non en StyleSheet React Native) : ce HTML
 * n'est pas rendu par React Native mais par le moteur d'impression du systeme.
 * ---------------------------------------------------------------------- */

/**
 * Echappe les caracteres speciaux HTML.
 * Indispensable : un nom contenant & ou < casserait le document, et on ne veut
 * pas qu'une donnee saisie par l'utilisateur puisse injecter du balisage.
 */
function echapper(texte) {
  return String(texte === null || texte === undefined ? '' : texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Construit le HTML du relevé.
 *
 * @param {object} params
 * @param {object} params.etudiant  l'etudiant concerne
 * @param {Array}  params.lignes    les lignes produites par construireReleve()
 * @param {number} params.moyenneGenerale
 * @param {string} params.dateEdition date d'edition, au format lisible
 */
export function construireHtmlReleve({ etudiant, lignes, moyenneGenerale, dateEdition }) {
  const nom = echapper(`${etudiant.firstName} ${etudiant.lastName}`);
  const laMention = mention(moyenneGenerale);

  // Une ligne de tableau par matiere. On indique aussi le detail des examens
  // quand la matiere en compte plusieurs, pour que le relevé soit verifiable.
  const lignesHtml = lignes
    .map((ligne) => {
      const detailExamens =
        ligne.notes.length > 1
          ? `<div class="detail">${ligne.notes
              .map(
                (n) =>
                  `${echapper(n.examType || 'Examen')} : ${formaterNote(n.score)}`
              )
              .join(' &middot; ')}</div>`
          : '';

      return `
        <tr>
          <td>
            <strong>${echapper(ligne.subject.name)}</strong>
            <div class="code">${echapper(ligne.subject.code)}</div>
            ${detailExamens}
          </td>
          <td class="centre">${ligne.coef}</td>
          <td class="centre note">${formaterNote(ligne.moyenneMatiere)} / ${NOTE_MAX}</td>
        </tr>`;
    })
    .join('');

  const sommeCoefs = lignes.reduce((total, ligne) => total + ligne.coef, 0);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Relevé de notes — ${nom}</title>
  <style>
    /* Format A4 avec marges d'impression. La page est un vrai document, pas
       une capture d'ecran : on raisonne en millimetres. */
    @page { size: A4; margin: 14mm 16mm; }

    * { box-sizing: border-box; }

    html, body { height: 100%; }

    /* Colonne flex sur toute la hauteur de la page : le contenu s'etire
       (flex: 1) et pousse le pied de page tout en bas, quelle que soit la
       quantite de matieres. Plus fiable que position: fixed, que les moteurs
       d'impression traitent de facon inegale. */
    body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      margin: 0;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      font-size: 12px;
      line-height: 1.45;
    }
    .corps { flex: 1 0 auto; }

    /* ---- En-tete institutionnel : etablissement a gauche, logo a droite ---- */
    .entete {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 12px;
      border-bottom: 2px solid ${COULEUR_ISGA};
    }
    .etablissement .sigle {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 1px;
      color: ${COULEUR_ISGA};
    }
    .etablissement .intitule {
      font-size: 11px;
      color: #555;
      margin-top: 1px;
    }
    .logo { height: 52px; width: auto; margin-left: 20px; }

    /* ---- Titre du document ---- */
    .titre {
      text-align: center;
      margin: 26px 0 22px;
    }
    .titre h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin: 0;
    }
    .titre .filet {
      width: 64px;
      height: 3px;
      background: ${COULEUR_ISGA};
      margin: 8px auto 0;
    }

    /* ---- Identite de l'etudiant, en deux colonnes ---- */
    .identite {
      border: 1px solid #d4d4d4;
      border-left: 4px solid ${COULEUR_ISGA};
      padding: 12px 16px;
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
    }
    .identite .nom {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 3px;
    }
    .identite .champ { font-size: 11px; color: #555; }
    .identite .colonne-droite { text-align: right; }

    /* ---- Tableau des notes ---- */
    table { width: 100%; border-collapse: collapse; }
    thead th {
      background: ${COULEUR_ISGA};
      color: #fff;
      text-align: left;
      padding: 9px 12px;
      font-size: 11px;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    th.centre, td.centre { text-align: center; }
    tbody td {
      padding: 10px 12px;
      border-bottom: 1px solid #e4e4e4;
      vertical-align: top;
    }
    /* Alternance de fond : lisibilite sur les tableaux longs */
    tbody tr:nth-child(even) td { background: #fafafa; }
    td .code { color: #777; font-size: 10px; margin-top: 2px; }
    td .detail { color: #777; font-size: 10px; margin-top: 5px; font-style: italic; }
    td.note { font-weight: 700; font-size: 13px; }

    /* ---- Bilan ---- */
    .bilan {
      margin-top: 20px;
      border: 1px solid #d4d4d4;
      border-top: 3px solid ${COULEUR_ISGA};
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .bilan .libelle {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .bilan .mention { font-size: 12px; color: #555; margin-top: 3px; }
    .bilan .valeur { font-size: 27px; font-weight: 800; color: ${COULEUR_ISGA}; }
    .bilan .valeur .max { font-size: 14px; font-weight: 600; color: #555; }

    .methode {
      margin-top: 14px;
      font-size: 9.5px;
      color: #777;
      line-height: 1.6;
      font-style: italic;
    }

    /* ---- Zone de signature ---- */
    .signatures {
      margin-top: 26px;
      display: flex;
      justify-content: flex-end;
    }
    .signature {
      width: 62mm;
      text-align: center;
    }
    .signature .fonction {
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .signature .lieu-date { font-size: 10px; color: #777; }
    .signature .cadre {
      margin-top: 6px;
      height: 26mm;
      border: 1px solid #c8c8c8;
    }
    .signature .legende {
      font-size: 9px;
      color: #999;
      margin-top: 4px;
      font-style: italic;
    }

    /* ---- Pied de page, pousse tout en bas par le flex du body ---- */
    .pied {
      flex-shrink: 0;
      text-align: center;
      font-size: 9.5px;
      color: #555;
      border-top: 1px solid #d4d4d4;
      padding-top: 7px;
      margin-top: 18px;
    }
    .pied .nom-etab { font-weight: 700; color: ${COULEUR_ISGA}; }
  </style>
</head>
<body>

  <div class="corps">

  <div class="entete">
    <div class="etablissement">
      <div class="sigle">${echapper(ETABLISSEMENT.sigle)}</div>
      <div class="intitule">${echapper(ETABLISSEMENT.nom)}</div>
    </div>
    <img class="logo" src="${LOGO_ISGA}" alt="${echapper(ETABLISSEMENT.sigle)}" />
  </div>

  <div class="titre">
    <h1>Relevé de notes</h1>
    <div class="filet"></div>
  </div>

  <div class="identite">
    <div>
      <div class="nom">${nom}</div>
      ${etudiant.email ? `<div class="champ">${echapper(etudiant.email)}</div>` : ''}
      ${
        etudiant.dateOfBirth
          ? `<div class="champ">Né(e) le ${echapper(etudiant.dateOfBirth)}</div>`
          : ''
      }
    </div>
    <div class="colonne-droite">
      <div class="champ">N° étudiant : ${echapper(etudiant.id)}</div>
      <div class="champ">Édité le ${echapper(dateEdition)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Matière</th>
        <th class="centre">Coef.</th>
        <th class="centre">Note</th>
      </tr>
    </thead>
    <tbody>${lignesHtml}</tbody>
  </table>

  <div class="bilan">
    <div>
      <div class="libelle">Moyenne générale pondérée</div>
      ${laMention ? `<div class="mention">Mention : ${echapper(laMention)}</div>` : ''}
    </div>
    <div class="valeur">${formaterNote(moyenneGenerale)}<span class="max"> / ${NOTE_MAX}</span></div>
  </div>

  <div class="methode">
    Méthode de calcul : la moyenne de chaque matière est la moyenne de ses
    examens ; la moyenne générale est la somme des moyennes pondérées par les
    coefficients, divisée par la somme des coefficients (${sommeCoefs}).
  </div>

  <div class="signatures">
    <div class="signature">
      <div class="fonction">Le Directeur des études</div>
      <div class="lieu-date">Rabat, le ${echapper(dateEdition)}</div>
      <div class="cadre"></div>
      <div class="legende">Signature et cachet de l'établissement</div>
    </div>
  </div>

  </div><!-- /corps -->

  <div class="pied">
    <span class="nom-etab">${echapper(ETABLISSEMENT.sigle)}</span>
    &nbsp;—&nbsp; ${echapper(ETABLISSEMENT.adresse)}
    &nbsp;—&nbsp; ${echapper(ETABLISSEMENT.telephone)}
  </div>

</body>
</html>`;
}
