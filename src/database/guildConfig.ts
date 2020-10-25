import { Schema, Document, Model, model } from 'mongoose';

const GuildConfig = new Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  maxWarns: { type: Number, min: 1, default: 3 },
  // This will be set in days.
  warnLifeSpan: { type: Number, min: 1, default: 7 },
  prefix: { type: String, default: 'v.' },
  modLog: { type: String, default: null },
  serverLog: { type: String, default: null },
  banMessage: { type: String, default: null, maxlength: 1020 },
  bannedWords: { type: [String], default: ['bad'], maxlength: 120 },
  muteRole: { type: String, default: null },
  nextCaseId: { type: Number, default: 1 },
  nextWarnId: { type: Number, default: 1 },
});

export interface IGuildConfig {
  guildId: string;
  maxWarns?: number;
  warnLifeSpan?: number;
  prefix?: string;
  modLog?: string;
  serverLog?: string;
  banMessage?: string;
  bannedWords?: string[];
  muteRole?: string;
  nextCaseId?: number;
  nextWarnId?: number;
}

export interface IGuildConfigDoc extends IGuildConfig, Document {}
export interface IGuildConfigModel extends Model<IGuildConfigDoc> {}
export default model<IGuildConfigDoc>('GuildConfig', GuildConfig);
