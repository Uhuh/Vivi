import * as DB from 'better-sqlite3';

const db = new DB('bowbot.db');

function checkDataBase() {
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
    SELECT count(*) FROM sqlite_master WHERE type='table' AND name='react_roles';
  `).get();

  if (!dbCheck['count(*)']) {
    console.log(`WARNING: Database appears empty; initializing it.`);
    const sqlInit = `
      CREATE TABLE react_roles (
        id INTEGER PRIMARY KEY,
        message_id TEXT,
        role_id TEXT,
        channel_id TEXT,
        emoji TEXT
      );

      CREATE TABLE user_rep (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        reputation INTEGER
      );

      CREATE TABLE coins (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        coins INTEGER
      );

      CREATE TABLE banned_words (
        id INTEGER PRIMARY KEY,
        word TEXT
      );

      CREATE TABLE rules (
        id INTEGER PRIMARY KEY,
        rule_position INTEGER,
        rule TEXT
      );

      CREATE TABLE warnings (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        reporter TEXT,
        reason TEXT,
        date TEXT
      );

      CREATE TABLE mod_cases (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        mod_id TEXT,
        reason TEXT,
        date TEXT
      );
    `;

    db.exec(sqlInit);
  }
}

checkDataBase();

export const MUTE_USER = (user_id: string, date_muted: string, unmute_date: string) =>
  db.prepare(
    `INSERT OR REPLACE INTO mutes (user_id, date_muted, unmute_date) VALUES (@user_id, @mute_date, @unmute_date)`
  )
  .run({ user_id, date_muted, unmute_date });

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

export const GET_USER_WARN = (user_id: string) =>
  db.prepare(`SELECT * FROM warnings WHERE user_id = @user_id`)
  .all({ user_id });

export const SET_WORD = (word: string) =>
  db.prepare(`INSERT OR REPLACE INTO banned_words (word) VALUES (@word)`)
  .run({ word });

export const GET_WORDS = () =>
  db.prepare(`SELECT word FROM banned_words`)
  .all();

export const REMOVE_WORD = (word: string) =>
  db.prepare(`DELETE FROM banned_words WHERE word = @word`)
  .run({ word });

export const GET_REP = (user_id: string) => 
  db.prepare(`SELECT * FROM user_rep WHERE user_id = @user_id`)
  .get({user_id});

export const SET_REP = (rep: {id: number, user_id: string, reputation: number}) =>
  db.prepare(`INSERT OR REPLACE INTO user_rep (id, user_id, reputation) VALUES (@id, @user_id, @reputation)`)
  .run({ ...rep });

export const GET_COINS = (user_id: string) => 
  db.prepare(`SELECT * FROM coins WHERE user_id = @user_id`)
  .get({user_id});

export const GET_REACTS = () => 
  db.prepare(`SELECT * FROM react_roles`)
  .all();

export const SET_REACT = (m: string, r: string, e: string, c: string) => 
  db.prepare(`
    INSERT OR REPLACE INTO react_roles (message_id, role_id, emoji, channel_id)
    VALUES (@m, @r, @e, @c)
  `).run({ m, r, e, c });