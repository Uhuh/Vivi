import { Schema, Document, Model, model } from 'mongoose';

const Mutes = new Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  dateMuted: { type: Number, required: true },
  unMuteDate: { type: Number, required: true },
});

export interface IMutes {
  guildId: string;
  userId: string;
  dateMuted: number;
  unMuteDate: number;
}

export interface IMuteDoc extends IMutes, Document {}
export interface IMuteModel extends Model<IMuteDoc> {}
export default model<IMuteDoc>('Mutes', Mutes);
