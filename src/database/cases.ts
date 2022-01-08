import { Schema, Document, Model, model } from 'mongoose';

const Cases = new Schema({
  guildId: { type: String, required: true },
  caseId: { type: Number, required: true },
  messageId: { type: String, default: null },
  userId: { type: String, required: true, default: null },
  modId: { type: String, required: true, default: null },
  type: { type: String, required: true, default: null },
  reason: { type: String, required: true, default: null },
  punishmentLength: { type: Date, default: new Date() },
  creationDate: { type: Date, default: new Date() },

  // Legacy warnID.
  warnId: { type: Number, default: null },
});

export enum CaseType {
  mute = 'mute',
  warn = 'warn',
  ban = 'ban',
  kick = 'kick',
  unban = 'unban',
  unmute = 'unmute',
  unwarn = 'unwarn',
}

export interface ICases {
  guildId: string;
  caseId: number;
  messageId: string;
  userId: string;
  modId: string;
  reason: string;
  type: CaseType;
  punishmentLength: Date;
  creationDate: Date;

  // Legacy system
  warnId?: number;
}

export interface ICasesDoc extends ICases, Document {}
export interface ICasesModel extends Model<ICasesDoc> {}
export default model<ICasesDoc>('Cases', Cases);
