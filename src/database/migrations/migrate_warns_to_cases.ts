import WarnModel from '../warnings';
import CaseModel, { CaseType } from '../cases';
import * as moment from 'moment';

export async function migrate_warns_to_cases(guildId: string) {
  const warns = await WarnModel.find({ guildId: Number(guildId) });

  for (const warn of warns) {
    await CaseModel.findOneAndUpdate(
      { guildId: guildId, warnId: warn.warnId },
      {
        reason: warn.reason,
        creationDate: moment.unix(warn.date).toDate(),
      }
    ).exec();
  }
  const updatedCases = await CaseModel.find({ guildId, type: CaseType.warn });
  console.log(updatedCases);
}
