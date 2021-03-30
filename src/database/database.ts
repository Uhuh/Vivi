import ConfigModel from './guild';
import CaseModel, { CaseType } from './cases';

/**
 * Create a new config model for guild.
 * @param guildId Newly joined guild or setup command guild id.
 */
export const GENERATE_GUILD_CONFIG = async (guildId: string) => {
  return await ConfigModel.create({ guildId }).catch(() =>
    console.error(`Failed to generate a config for guild[${guildId}]`)
  );
};

/**
 * Get a specific guild config.
 * @param guildId Guild Id to retrieve specific guild config.
 */
export const GET_GUILD_CONFIG = async (guildId: string) => {
  return await ConfigModel.findOne({ guildId });
};

/**
 * Get all guild prefixes.
 */
export const ALL_GUILD_PREFIXES = async () => {
  return await ConfigModel.find({}, 'guildId prefix');
};

/**
 * Get joinRoles for a single guild.
 * @param guildId Guild ID
 */
export const GUILD_JOIN_ROLES = async (guildId: string) => {
  return await ConfigModel.findOne({ guildId }, 'joinRoles');
};

/**
 * Add a role ID to a specific guilds joinRoles array.
 * @param guildId Guild ID
 * @param roleId Role ID to be added to joinRoles
 */
export const ADD_JOIN_ROLE = async (guildId: string, roleId: string) => {
  return await ConfigModel.findOneAndUpdate(
    { guildId },
    {
      $push: {
        joinRoles: {
          $each: [roleId],
        },
      },
    }
  );
};

/**
 * Remove a role ID from a specific guilds joinRoles array.
 * @param guildId Guild ID
 * @param roleId Role ID to be removed from joinRoles
 */
export const REMOVE_JOIN_ROLE = async (guildId: string, roleId: string) => {
  return await ConfigModel.findOneAndUpdate(
    { guildId },
    {
      $pull: {
        joinRoles: {
          $in: [roleId],
        },
      },
    }
  );
};

/**
 * Create new mod case and link to message and warn, if given.
 * @param guildId Guild ID is to calculate the next case ID
 * @param modId ID of mod that did the action.
 * @param userId ID of user being acted upon
 * @param messageId ID of message embed in mod log channel
 * @param type Type of mod event
 * @param punishmentLength Date when users punishment will end.
 */
export const NEW_CASE = async (
  guildId: string,
  modId: string,
  userId: string,
  messageId: string,
  type: CaseType,
  punishmentLength?: Date
) => {
  const config = await ConfigModel.findOne({ guildId });
  if (!config) return console.error(`Could not find guild config`);

  CaseModel.create({
    guildId,
    caseId: config.nextCaseId!++,
    modId,
    userId,
    messageId,
    type,
    punishmentLength,
  })
    .then(() => {
      config.save();
      console.log(
        `Successfully created case for user[${userId}] by mod[${modId}]`
      );
    })
    .catch((err: any) => {
      console.error(
        `Error creating case for user[${userId}] by mod[${modId}] : Type[${CaseType[type]}]`
      );
      console.error(err);
    });
};

/**
 * Return a mod log case with the given case ID.
 * @param caseId ID from mongoose. Displayed on each modlog case message.
 */
export const GET_CASE = async (guildId: string, caseId: number) => {
  return await CaseModel.findOne({ guildId, caseId });
};

/**
 *
 * I think maybe that instead of deleting it just sets the reason to `Warning removed by X (mod)`
 * and then expires the punishment date.
 */
/**
 * Delete case. Only needed for warnings.
 * @param caseId ID from mongoose. Displayed on each modlog case message.
 */
export const DELETE_CASE = async (guildId: string, caseId: number) => {
  return CaseModel.findOneAndDelete({ guildId, caseId });
};

/**
 * Updates the reason of a users warning.
 * @param id ID from mongoose.
 * @param reason Updated warn reason.
 */
export const UPDATE_CASE_REASON = (
  guildId: string,
  caseId: number,
  reason: string
) => {
  CaseModel.findOneAndUpdate({ guildId, caseId }, { reason })
    .then(() => {
      console.log('Updated warn with new reason');
    })
    .catch(() =>
      console.error(
        `Error on updating warn[${caseId}] with reason["${reason}"]`
      )
    );
};

/**
 * Grab all warnings of a user.
 * @param userId User ID to get warns of.
 */
export const GET_USER_WARNS = async (guildId: string, userId: string) => {
  return await CaseModel.find({ guildId, userId, type: CaseType.Warn });
};

/**
 * Get a single warning for a specific guild.
 * @param guildId Guild ID
 * @param caseId Warn ID to find specific warn.
 */
export const GET_WARN = async (guildId: string, caseId: number) => {
  return await CaseModel.findOne({ guildId, caseId, type: CaseType.Warn });
};

/**
 * Set a guilds mod log channel.
 * @param guildId The guild to save config settings of.
 * @param modLog The mod channel id.
 */
export const SET_MOD_CHANNEL = (guildId: string, modLog: string) => {
  ConfigModel.findOneAndUpdate(
    { guildId },
    { modLog },
    { new: true },
    (err: any) => {
      if (err) console.error(`Error on setting mod log channel.`);
    }
  );
};

/**
 * Set a guilds server log channel.
 * @param guildId The guild to save config settings of.
 * @param serverLog The server channel id.
 */
export const SET_SERVER_CHANNEL = (guildId: string, serverLog: string) => {
  ConfigModel.findOneAndUpdate(
    { guildId },
    { serverLog },
    { new: true },
    (err: any) => {
      if (err) console.error(`Error on setting server log channel.`);
    }
  );
};

/**
 * Add a channel ID to list of ignored channels for server logging.
 * @param guildId Guild ID for ConfigModel
 * @param channelId Channel ID for serverlogging to ignore.
 */
export const ADD_CHANNEL_WHITELIST = async (
  guildId: string,
  channelId: string
) => {
  return ConfigModel.findOneAndUpdate(
    { guildId },
    {
      $push: {
        serverLogWhitelist: {
          $each: [channelId],
        },
      },
    }
  );
};

/**
 * Remove a channel Id from server logging whitelist.
 * @param guildId Guild ID for ConfigModel
 * @param channelId Channel ID to remove from whitelist.
 */
export const REMOVE_CHANNEL_WHITELIST = async (
  guildId: string,
  channelId: string
) => {
  return ConfigModel.findOneAndUpdate(
    { guildId },
    {
      $pull: {
        serverLogWhitelist: {
          $in: [channelId],
        },
      },
    }
  );
};

/**
 * Get banned words array for a specific guild.
 * @param guildId Guild ID
 */
export const GET_BANNED_WORDS = async (guildId: string) => {
  const config = await ConfigModel.findOne({ guildId });
  if (!config) {
    console.error(
      `Failed to get guild[${guildId}] when grabbing banned word list.`
    );
  }
  return config?.bannedWords || [];
};

/**
 * Add new word to a guilds banned list.
 * @param guildId Guild ID to add new banned word to
 * @param words The word(s) to be added to banned list
 */
export const NEW_BANNED_WORD = async (guildId: string, words: string[]) => {
  return ConfigModel.findOneAndUpdate(
    { guildId },
    {
      $addToSet: {
        bannedWords: {
          $each: words,
        },
      },
    }
  ).catch(() =>
    console.error(
      `Error on adding banned words, could not find guild[${guildId}]`
    )
  );
};

/**
 * Remove a word from a guilds banned word list.
 * @param guildId The guild to remove a banned word from.
 * @param worda The word(s) to remove.
 */
export const REMOVE_BANNED_WORD = async (guildId: string, words: string[]) => {
  return ConfigModel.findOneAndUpdate(
    { guildId },
    {
      $pull: {
        bannedWords: {
          $in: words,
        },
      },
    },
    { new: true },
    (err: any) => {
      if (err) {
        return console.error(
          `Error on removing words[${words}] for guild[${guildId}]`
        );
      }
    }
  );
};

/**
 * Set a guilds ban message. This gets sent to users when they're banned.
 * @param guildId Guild to set banned message for.
 * @param message Banned message, max length is 1020 chars.
 */
export const SET_BANNED_MSG = async (guildId: string, banMessage: string) => {
  return ConfigModel.findOneAndUpdate({ guildId }, { banMessage });
};

/**
 * Change the guilds prefix.
 * @param guildId Guild Id to get ConfigModel.
 * @param prefix Prefix to set for guild.
 */
export const SET_GUILD_PREFIX = async (guildId: string, prefix: string) => {
  return ConfigModel.findOneAndUpdate({ guildId }, { prefix });
};

/**
 * Set a role as a guilds mute role.
 * @param guildId Guild ID to get ConfigModel
 * @param muteRole Role ID to set as the mute role.
 */
export const SET_MUTE_ROLE = (guildId: string, muteRole: string) => {
  ConfigModel.findOneAndUpdate(
    { guildId },
    { muteRole },
    { new: true },
    (err: any) => {
      if (err)
        return console.error(
          `Error on setting guilds[${guildId}] mute role[${muteRole}]`
        );
    }
  );
};

/**
 * Remove the mute role from guild config.
 * @param guildId Guild ID to get ConfigModel.
 */
export const REMOVE_MUTE_ROLE = (guildId: string) => {
  ConfigModel.findOneAndUpdate(
    { guildId },
    { $unset: { muteRole: 1 } }
  ).catch(() => console.error(`Error on removing mute role`));
};

/**
 * Set a maximum amount of warns a user can get for the guild.
 * @param guildId Guild ID to set Config/
 * @param maxWarns Max allowed warnings for this guild config.
 */
export const SET_WARN_LIMIT = (guildId: string, maxWarns: number) => {
  return ConfigModel.findOneAndUpdate({ guildId }, { maxWarns }).catch(() =>
    console.error(`Error on setting max warns for guild[${guildId}]`)
  );
};

/**
 * Set how many days until a warn expires in the guild.
 * @param guildId Guild ID to get ConfigModel
 * @param warnLifeSpan Number of days til warn expires.
 */
export const SET_WARN_EXPIRE = async (
  guildId: string,
  warnLifeSpan: number
) => {
  return ConfigModel.findOneAndUpdate({ guildId }, { warnLifeSpan });
};

/**
 * Get all mutes in this guild.
 * @param guildId Guild ID for CaseModel
 */
export const GET_GUILD_MUTES = async (guildId: string) => {
  return await CaseModel.find({ guildId, type: CaseType.Mute });
};

/**
 * Extend or shorten a users mute date.
 * @param guildId Guild ID for CaseModel
 * @param userId User to update mute for.
 * @param punishmentLength New unmute date.
 */
export const UPDATE_USER_MUTE = (
  guildId: string,
  userId: string,
  caseId: number,
  punishmentLength: Date
) => {
  CaseModel.findOneAndUpdate(
    { guildId, userId, caseId },
    { punishmentLength }
  ).catch(() =>
    console.error(
      `Error on updating user[${userId}] mute time[${punishmentLength}]`
    )
  );
};

/**
 * Remove user from mute list.
 * @param guildId Guild ID for MuteModel
 * @param userId User to unmute.
 */
export const UNMUTE_USER = async (guildId: string, userId: string) => {
  return CaseModel.findOneAndDelete({ guildId, userId, type: CaseType.Mute });
};

/**
 * Get a users mute details.
 * @param guildId Guild ID for MuteModel.
 * @param userId User mute to retrieve.
 */
export const GET_USER_MUTE = async (guildId: string, userId: string) => {
  return await CaseModel.findOne({ guildId, userId, type: CaseType.Mute });
};

/**
 * Get all users for whom unmute dates are passed.
 * @param guildId Guild ID to check for unmuted users.
 */
export const GET_UNMUTED_USERS = async (guildId: string) => {
  return CaseModel.find({
    guildId,
    type: CaseType.Mute,
    punishmentLength: {
      $lt: new Date(),
    },
  });
};

/**
 * Set a role ID to allow anyone with this role to gain access to mod commands.
 * @param guildId Guild ID to get ConfigModel.
 * @param modRole Role ID to set as the mod role.
 */
export const SET_MOD_ROLE = async (guildId: string, modRole: string) => {
  ConfigModel.findOneAndUpdate(
    { guildId },
    { modRole },
    { new: true },
    (err: any) => {
      if (err)
        return console.error(
          `Error on setting guilds[${guildId}] mute role[${modRole}]`
        );
    }
  );
};

/**
 * Remove the mod role ID.
 * @param guildId Guild ID to get ConfigModel
 */
export const REMOVE_MOD_ROLE = async (guildId: string) => {
  ConfigModel.findOneAndUpdate(
    { guildId },
    { $unset: { modRole: 1 } }
  ).catch(() => console.error(`Error on removing mute role`));
};
