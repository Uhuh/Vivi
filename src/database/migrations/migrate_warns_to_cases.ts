import WarnModel from '../warnings';
import CaseModel from '../cases';

export async function migrate_warns_to_cases(guildId: string) {
  const warns = await WarnModel.find({ guildId });
  console.log(warns);

  for (const warn of warns) {
    CaseModel.findOneAndUpdate(
      { guildId: warn.guildId, warnId: warn.warnId },
      {
        reason: warn.reason,
      }
    );
  }
}
