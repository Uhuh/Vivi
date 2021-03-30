import { Schema, Document, Model, model } from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import * as config from '../vars';

const GuildConfig = new Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  maxWarns: { type: Number, min: 1, default: 3 },
  // This will be set in days.
  warnLifeSpan: { type: Number, min: 1, default: 7 },
  prefix: { type: String, default: 'v.' },
  modLog: { type: String, default: null },
  serverLog: { type: String, default: null },
  serverLogWhitelist: { type: [String], default: [] },
  banMessage: { type: String, default: null, maxlength: 1020 },
  bannedWords: {
    type: [String],
    default: [...config.DEFAULT_BANNED.split(' ')],
    maxlength: 120,
  },
  joinRoles: {
    type: [String],
    default: [],
    maxlength: 5,
  },
  muteRole: { type: String, default: null },
  modRole: { type: String, default: null },
  nextCaseId: { type: Number, default: 1 },
});

export interface IGuildConfig {
  guildId: string;
  maxWarns?: number;
  warnLifeSpan?: number;
  prefix?: string;
  modLog?: string;
  serverLog?: string;
  serverLogWhitelist?: string[];
  banMessage?: string;
  bannedWords?: string[];
  joinRoles?: string[];
  muteRole?: string;
  modRole?: string;
  nextCaseId?: number;
}

export interface IGuildConfigDoc extends IGuildConfig, Document {}
export interface IGuildConfigModel extends Model<IGuildConfigDoc> {}
export default model<IGuildConfigDoc>('GuildConfig', GuildConfig);
