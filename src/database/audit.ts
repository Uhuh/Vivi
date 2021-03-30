import { Schema, Document, Model, model } from 'mongoose';

const Audit = new Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true, default: null },
  username: { type: String, required: true, default: null },
  /**
   * Possibly...
   * Created
   * Modified
   * Deleted
   * ?
   */
  type: { type: String, required: true, default: null },
  /**
   * This doesn't work well with cases. Figured out how to handle
   * server config update + mod cases.
   */
  oldValue: { type: String, default: null },
  newValue: { type: String, default: null },
  creationDate: { type: Date, default: new Date() },
});

export interface IAudit {
  guildId: string;
  userId: string;
  username: string;
  oldValue: string;
  newValue: string;
  type: string;
  creationDate: Date;
}

export interface IAuditDoc extends IAudit, Document {}
export interface IAuditModel extends Model<IAuditDoc> {}
export default model<IAuditDoc>('Audit', Audit);
