import { Schema, Document, Model, model } from 'mongoose';

const Cases = new Schema({
  guildId: { type: String, required: true },
  caseId: { type: Number, required: true },
  messageId: { type: String, required: true, default: null },
  userId: { type: String, required: true, default: null },
  modId: { type: String, required: true, default: null },
  type: { type: Number, required: true, default: null },
  punishmentLength: { type: Date, default: new Date() },
  creationDate: { type: Date, default: new Date() },
});

export enum CaseType {
  Warn = 1,
  UnWarn = 2,
  Mute = 3,
  UnMute = 4,
  Ban = 5,
  UnBan = 6,
  Kick = 7,
}

export interface ICases {
  guildId: string;
  caseId: number;
  messageId: string;
  userId: string;
  modId: string;
  type: CaseType;
  punishmentLength: Date;
  creationDate: Date;
}

export interface ICasesDoc extends ICases, Document {}
export interface ICasesModel extends Model<ICasesDoc> {}
export default model<ICasesDoc>('Cases', Cases);
