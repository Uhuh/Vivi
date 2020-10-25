import * as DB from 'better-sqlite3';

const db = new DB('bowbot.db');

function checkDataBase() {
  const logChannels = db
    .prepare(
      `
    SELECT count(*) FROM sqlite_master WHERE type='table' AND name='log_channels';
  `
    )
    .get();

  if (!logChannels['count(*)']) {
    console.log(`WARNING: Log channels table missing; generating`);
    const sqlInit = `
      CREATE TABLE log_channels (
        id INTEGER PRIMARY KEY,
        guild_id TEXT,
        mod_logs TEXT,
        server_logs TEXT
      );
    `;

    db.exec(sqlInit);
  }

  const caseCheck = db
    .prepare(
      `
    SELECT count(*) FROM sqlite_master WHERE type='table' AND name='mod_cases';
  `
    )
    .get();

  if (!caseCheck['count(*)']) {
    console.log(`WARNING: Cases table missing; generating`);
    const sqlInit = `
      CREATE TABLE mod_cases (
        id INTEGER PRIMARY KEY,
        message_id TEXT,
        user_id TEXT,
        mod_id TEXT,
        warn_id TEXT,
        type TEXT
      );
    `;

    db.exec(sqlInit);
  }

  const muteCheck = db
    .prepare(
      `
    SELECT count(*) FROM sqlite_master WHERE type='table' AND name='mutes';
  `
    )
    .get();

  if (!muteCheck['count(*)']) {
    console.log(`WARNING: Mute table missing; generating`);
    const sqlInit = `
      CREATE TABLE mutes (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        date_muted TEXT,
        unmute_date TEXT
      );
    `;

    db.exec(sqlInit);
  }
}

checkDataBase();
