import { Schema, Document, Model, model } from 'mongoose';

const Warnings = new Schema({
  guildId: { type: Number, required: true },
  warnId: { type: Number, required: true },
  reason: { type: String, required: true, default: null },
  userId: { type: String, required: true, default: null },
  modId: { type: String, required: true, default: null },
  date: { type: Number, required: true, default: null },
});

export interface IWarn {
  guildId: string;
  warnId: number;
  reason: string;
  userId: string;
  modId: string;
  date: number;
}

export interface IWarnDoc extends IWarn, Document {}
export interface IWarnModel extends Model<IWarnDoc> {}
export default model<IWarnDoc>('Warnings', Warnings);
