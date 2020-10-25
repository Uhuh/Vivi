import { Schema, Document, Model, model } from 'mongoose';

const Cases = new Schema({
  guildId: { type: Number, required: true },
  caseId: { type: Number, required: true },
  messageId: { type: String, required: true, default: null },
  userId: { type: String, required: true, default: null },
  modId: { type: String, required: true, default: null },
  warnId: { type: String, default: null },
  type: { type: String, required: true, default: null },
});

export interface ICases {
  guildId: string;
  caseId: number;
  messageId: string;
  userId: string;
  modId: string;
  warnId?: string;
  type: string;
}

export interface ICasesDoc extends ICases, Document {}
export interface ICasesModel extends Model<ICasesDoc> {}
export default model<ICasesDoc>('Cases', Cases);
