import * as SQLite from 'expo-sqlite';

// 1. Ouvrir la base de données (Nouvelle méthode Sync)
const db = SQLite.openDatabaseSync('tantsaha.db');

// 2. Initialiser la table
export function initDatabase() {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        icon TEXT,
        text TEXT,
        date TEXT,
        synced INTEGER DEFAULT 0
      );
    `);
    console.log("Base de données initialisée !");
  } catch (error) {
    console.log("Erreur init DB:", error);
  }
}

// 3. Ajouter une entrée
export function addJournalEntry(icon, text) {
  const date = new Date().toISOString();
  try {
    const result = db.runSync(
      'INSERT INTO journal (icon, text, date, synced) VALUES (?, ?, ?, 0)',
      [icon, text, date]
    );
    return {
      id: result.lastInsertRowId,
      icon,
      text,
      date,
      synced: 0
    };
  } catch (error) {
    console.log("Erreur ajout:", error);
    return null;
  }
}

// 4. Récupérer toutes les entrées
export function getJournalEntries() {
  try {
    const allRows = db.getAllSync('SELECT * FROM journal ORDER BY date DESC');
    return allRows;
  } catch (error) {
    console.log("Erreur lecture:", error);
    return [];
  }
}

// 5. Supprimer une entrée
export function deleteJournalEntry(id) {
  try {
    db.runSync('DELETE FROM journal WHERE id = ?', [id]);
  } catch (error) {
    console.log("Erreur suppression:", error);
  }
}