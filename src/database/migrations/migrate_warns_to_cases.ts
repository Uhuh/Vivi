import WarnModel from '../warnings';
import CaseModel, { CaseType } from '../cases';
import * as moment from 'moment';

export async function migrate_warns_to_cases(guildId: string) {
  const warns = await WarnModel.find({ guildId: Number(guildId) });

  console.log(`==================== WARN ====================`);
  for (const warn of warns) {
    console.log(warn);

    await CaseModel.findOneAndUpdate(
      { guildId, userId: warn.userId, warnId: warn.warnId },
      {
        reason: warn.reason,
        creationDate: moment.unix(warn.date).toDate(),
      }
    ).exec();
  }

  // nuke_null_reason(guildId);

  console.log(`==================== UPDATED CASES ====================`);
  const updatedCases = await CaseModel.find({ guildId, type: CaseType.warn });
  console.log(updatedCases);
}

export function nuke_null_reason(guildId: string) {
  CaseModel.findOneAndDelete({
    guildId,
    type: CaseType.warn,
    //@ts-ignore
    reason: null,
  });
}
