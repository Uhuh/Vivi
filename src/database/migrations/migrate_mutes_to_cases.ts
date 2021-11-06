import * as moment from 'moment';
import CaseModel, { CaseType } from '../cases';
import MuteModel from '../mutes';

export async function migrate_mutes_to_cases() {
  const mutes = await MuteModel.find({});

  for (const mute of mutes) {
    CaseModel.findOneAndUpdate(
      { guildId: mute.guildId, type: CaseType.mute, userId: mute.userId },
      {
        punishmentLength: moment.unix(mute.unMuteDate).toDate(),
        creationDate: moment.unix(mute.dateMuted).toDate(),
      }
    );
  }
}
