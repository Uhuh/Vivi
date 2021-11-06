import WarnModel from '../warnings';
import CaseModel from '../cases';
import * as moment from 'moment';

export async function migrate_warns_to_cases(guildId: string) {
  const warns = await WarnModel.find({ guildId });
  console.log(warns);

  for (const warn of warns) {
    CaseModel.findOneAndUpdate(
      { guildId: guildId, userId: warn.userId, warnId: warn.warnId },
      {
        reason: warn.reason,
        creationDate: moment(warn.date).toDate(),
      }
    );
  }
  const updatedCases = await CaseModel.find({ guildId });
  console.log(updatedCases);
}
