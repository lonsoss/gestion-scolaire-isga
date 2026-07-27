import client from './client';

/* Service API des Notes.
 * Endpoints REST : /scores
 * Format JSON : { id, studentId, subjectId, score, examDate, examType }
 *
 * Une note est rattachee a un Etudiant ET a une Matiere via studentId et
 * subjectId. Le backend ne posant AUCUNE cle etrangere sur la table `scores`,
 * rien ne l'empeche d'accepter un studentId inexistant : c'est pourquoi le
 * formulaire de note utilise des listes de selection alimentees par l'API
 * plutot qu'une saisie libre d'identifiant.
 */

export async function getScores() {
  const res = await client.get('/scores');
  return res.data;
}

export async function getScore(id) {
  const res = await client.get(`/scores/${id}`);
  return res.data;
}

/** Toutes les notes d'un etudiant — utilise par l'ecran Releve. */
export async function getScoresByStudent(studentId) {
  const res = await client.get(`/scores/student/${studentId}`);
  return res.data;
}

/** Toutes les notes d'une matiere. */
export async function getScoresBySubject(subjectId) {
  const res = await client.get(`/scores/subject/${subjectId}`);
  return res.data;
}

export async function createScore(score) {
  const res = await client.post('/scores', score);
  return res.data;
}

export async function updateScore(id, score) {
  const res = await client.put(`/scores/${id}`, score);
  return res.data;
}

export async function deleteScore(id) {
  await client.delete(`/scores/${id}`);
}
