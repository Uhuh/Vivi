import * as DB from 'better-sqlite3';

const db = new DB('bowbot.db');

function checkDataBase() {
  const tagCheck = db.prepare(`
    SELECT count(*) FROM sqlite_master WHERE type='table' AND name='tags';
  `).get();

  if (!tagCheck['count(*)']) {
    console.log(`WARNING: Tags table missing; generating`);
    const sqlInit = `
      CREATE TABLE tags (
        id INTEGER PRIMARY KEY,
        tag TEXT,
        tag_text TEXT
      );
    `;

    db.exec(sqlInit);
  }

  const caseCheck = db.prepare(`
    SELECT count(*) FROM sqlite_master WHERE type='table' AND name='mod_cases';
  `).get();

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

  const muteCheck = db.prepare(`
    SELECT count(*) FROM sqlite_master WHERE type='table' AND name='mutes';
  `).get();

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

  const dbCheck = db.prepare(`
    SELECT count(*) FROM sqlite_master WHERE type='table' AND name='warnings';
  `).get();

  if (!dbCheck['count(*)']) {
    console.log(`WARNING: Database appears empty; initializing it.`);
    const sqlInit = `
      CREATE TABLE banned_words (
        id INTEGER PRIMARY KEY,
        word TEXT
      );

      CREATE TABLE warnings (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        reporter TEXT,
        reason TEXT,
        date TEXT
      );
    `;

    db.exec(sqlInit);
  }
}

checkDataBase();

export const NEW_CASE = (
  mod_id: string, 
  user_id: string, 
  message_id: string,
  type: string,
  warn_id: string
) => 
  db.prepare(`INSERT OR REPLACE INTO mod_cases (mod_id, user_id, message_id, type, warn_id) VALUES (@mod_id, @user_id, @message_id, @type, @warn_id)`)
  .run({ mod_id, user_id, message_id, type, warn_id });

export const GET_CASE = (id: string) =>
  db.prepare(`SELECT * FROM mod_cases WHERE id = @id`)
  .get({ id });

export const GET_NEW_CASE = () =>
  db.prepare(`SELECT * FROM mod_cases ORDER BY id DESC LIMIT 1`)
  .get();

export const MUTE_USER = (user_id: string, date_muted: number, unmute_date: number) =>
  db.prepare(
    `INSERT INTO mutes (user_id, date_muted, unmute_date) VALUES (@user_id, @date_muted, @unmute_date)`
  )
  .run({ user_id, date_muted, unmute_date });

export const REMOVE_MUTE = (user_id: string) =>
  db.prepare(`DELETE FROM mutes WHERE user_id = @user_id`)
  .run({ user_id });

export const GET_MUTES = () =>
  db.prepare(`SELECT * FROM mutes`)
  .all();

export const GET_USER_MUTE = (user_id: string) =>
  db.prepare(`SELECT * FROM mutes WHERE user_id = @user_id`)
  .get({ user_id });

export const SET_WARN = (
  user_id: string, 
  reason: string, 
  reporter: string, 
  date = Math.trunc(new Date().getTime()/1000)
) =>
  db.prepare(`INSERT OR REPLACE INTO warnings (user_id, reason, reporter, date) VALUES (@user_id, @reason, @reporter, @date)`)
  .run({ user_id, reason, reporter, date });

export const DELETE_WARN = (id: string) =>
  db.prepare(`DELETE FROM warnings WHERE id = @id`)
  .run({ id });

export const GET_LAST_WARN = () =>
  db.prepare(`SELECT * FROM warnings ORDER BY id DESC LIMIT 1`)
  .get();

export const WARN_REASON = (id: string, reason: string) =>
  db.prepare(`UPDATE warnings SET reason = @reason WHERE id = @id`)
  .run({ id, reason });

export const GET_WARNS = () =>
  db.prepare(`SELECT * FROM warnings`)
  .all();

export const GET_USER_WARN = (user_id: string) =>
  db.prepare(`SELECT * FROM warnings WHERE user_id = @user_id`)
  .all({ user_id });

export const SET_WORD = (word: string) =>
  db.prepare(`INSERT OR REPLACE INTO banned_words (word) VALUES (@word)`)
  .run({ word });

export const GET_WORDS = () =>
  db.prepare(`SELECT * FROM banned_words`)
  .all();

export const GET_NEW_WORD = () =>
  db.prepare(`SELECT * FROM banned_words ORDER BY id DESC LIMIT 1`)
  .get();

export const REMOVE_WORD = (id: Number) =>
  db.prepare(`DELETE FROM banned_words WHERE id = @id`)
  .run({ id });

export const GET_REP = (user_id: string) => 
  db.prepare(`SELECT * FROM user_rep WHERE user_id = @user_id`)
  .get({user_id});

export const SET_REP = (rep: {id: number, user_id: string, reputation: number}) =>
  db.prepare(`INSERT OR REPLACE INTO user_rep (id, user_id, reputation) VALUES (@id, @user_id, @reputation)`)
  .run({ ...rep });

export const GET_COINS = (user_id: string) => 
  db.prepare(`SELECT * FROM coins WHERE user_id = @user_id`)
  .get({user_id});
