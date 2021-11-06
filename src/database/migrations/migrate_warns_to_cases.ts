import WarnModel from '../warnings';
import CaseModel, { CaseType } from '../cases';
import * as moment from 'moment';

export async function migrate_warns_to_cases(guildId: string) {
  const warns = await WarnModel.find({ guildId: Number(guildId) });

  for (const warn of warns) {
    await CaseModel.findOneAndUpdate(
      { guildId, userId: warn.userId, warnId: warn.warnId },
      {
        reason: warn.reason,
        creationDate: moment.unix(warn.date).toDate(),
      }
    ).exec();
  }

  await nuke_null_reason(guildId);
}

export async function nuke_null_reason(guildId: string) {
  const warns = await CaseModel.find({ guildId, type: CaseType.warn });

  for (const warn of warns) {
    if (!warn.reason) {
      CaseModel.findOneAndDelete({
        guildId,
        caseId: warn.caseId,
      }).exec();
    }
  }
}
