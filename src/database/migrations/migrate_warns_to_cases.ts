import WarnModel from '../warnings';
import CaseModel, { CaseType } from '../cases';
import * as moment from 'moment';
import { warnExpire } from 'commands/config';

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

export async function nuke_null_reason(guildId: string) {
  const warns = await CaseModel.find({ guildId, type: CaseType.warn });
  console.log(warns);

  for (const warn of warns) {
    if (!warn.reason) {
      console.log(`Nuking warn: ${warn.warnId} - Case: ${warn.caseId}`);
      CaseModel.findOneAndDelete({
        caseId: warn.caseId,
      }).exec();
    }
  }
}
