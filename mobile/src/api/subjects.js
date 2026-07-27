import client from './client';

/* Service API des Matieres.
 * Endpoints REST : /subjects
 * Format JSON : { id, name, code, description, credits }
 *
 * NOTE IMPORTANTE : le backend n'a pas de champ "coefficient". C'est le champ
 * `credits` qui joue ce role (Mathematiques = 3, Physique = 4). Il est donc
 * utilise comme coefficient dans le calcul de la moyenne du relevé.
 */

export async function getSubjects() {
  const res = await client.get('/subjects');
  return res.data;
}

export async function getSubject(id) {
  const res = await client.get(`/subjects/${id}`);
  return res.data;
}

export async function createSubject(subject) {
  const res = await client.post('/subjects', subject);
  return res.data;
}

export async function updateSubject(id, subject) {
  const res = await client.put(`/subjects/${id}`, subject);
  return res.data;
}

export async function deleteSubject(id) {
  await client.delete(`/subjects/${id}`);
}
