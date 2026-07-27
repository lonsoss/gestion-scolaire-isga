import client from './client';

/* Service API des Etudiants.
 * Endpoints REST : /students
 * Format JSON : { id, firstName, lastName, email, dateOfBirth }
 *
 * Chaque fonction est `async` et renvoie directement les donnees utiles
 * (res.data). Les erreurs ne sont PAS capturees ici : on les laisse remonter
 * pour que l'ecran appelant puisse afficher un message et couper son
 * indicateur de chargement dans un try/catch/finally.
 */

export async function getStudents() {
  const res = await client.get('/students');
  return res.data;
}

export async function getStudent(id) {
  const res = await client.get(`/students/${id}`);
  return res.data;
}

export async function createStudent(student) {
  const res = await client.post('/students', student);
  return res.data;
}

export async function updateStudent(id, student) {
  const res = await client.put(`/students/${id}`, student);
  return res.data;
}

export async function deleteStudent(id) {
  await client.delete(`/students/${id}`);
}

/** Nom affichable d'un etudiant, utilise dans les listes et le relevé. */
export function nomComplet(student) {
  if (!student) return '';
  return `${student.firstName} ${student.lastName}`;
}
