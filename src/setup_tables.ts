import * as DB from 'better-sqlite3';

const db = new DB('bowbot.db');

function checkDataBase() {
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
    `;

    db.exec(sqlInit);
  }
}

checkDataBase();

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