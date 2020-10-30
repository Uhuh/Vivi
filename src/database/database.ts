import ConfigModel from './guildConfig';
import CaseModel from './cases';
import MuteModel from './mutes';
import WarnModel from './warnings';
import * as moment from 'moment';

export type CaseType =
  | 'unmute'
  | 'mute'
  | 'warn'
  | 'ban'
  | 'unban'
  | 'kick'
  | 'unwarn';

export const GENERATE_GUILD_CONFIG = async (guildId: string) => {
  return await ConfigModel.create({ guildId }).catch(() => {
    console.error(`Failed to generate a config for guild[${guildId}]`);
  });
};

export const GET_GUILD_CONFIG = async (guildId: string) => {
  return await ConfigModel.findOne({ guildId });
};

export const ALL_GUILD_PREFIXES = async () => {
  return await ConfigModel.find({}, 'guildId prefix');
};

/**
 * Create new mod case and link to message and warn, if given.
 * @param guildId Guild ID is to calculate the next case ID
 * @param modId ID of mod that did the action.
 * @param userId ID of user being acted upon
 * @param messageId ID of message embed in mod log channel
 * @param type Type of mod event
 * @param warnId If the case involves a user being warned pass the ID.
 */
export const NEW_CASE = async (
  guildId: string,
  modId: string,
  userId: string,
  messageId: string,
  type: CaseType,
  warnId?: number
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
    warnId,
  })
    .then(() => {
      config.save();
      console.log(
        `Successfully created case for user[${userId}] by mod[${modId}]`
      );
    })
    .catch((err) => {
      console.error(
        `Error creating case for user[${userId}] by mod[${modId}] : Type[${type}]`
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
 * Warn a user
 * @param userId User being warned
 * @param modId Mod that issued the warn
 * @param reason Reason why user was warned
 * @param date The time of the warn
 */
export const CREATE_WARN = async (
  guildId: string,
  userId: string,
  modId: string,
  reason: string,
  date = String(Math.trunc(new Date().getTime() / 1000))
) => {
  const config = await ConfigModel.findOne({ guildId });
  if (!config) return console.error(`Could not find guild config`);

  WarnModel.create({
    guildId,
    warnId: config.nextWarnId!++,
    userId,
    modId,
    reason,
    date,
  })
    .then(() => {
      config.save();
      console.log(
        `Successfully created warn for user[${userId}] by mod[${modId}]`
      );
    })
    .catch(() => {
      console.error(`Error creating warn for user[${userId}] by mod[${modId}]`);
    });
};

/**
 * Delete a users warning.
 * @param id ID from mongoose.
 */
export const DELETE_WARN = async (guildId: string, warnId: number) => {
  return WarnModel.findOneAndDelete({ guildId, warnId });
};

/**
 * Updates the reason of a users warning.
 * @param id ID from mongoose.
 * @param reason Updated warn reason.
 */
export const UPDATE_WARN_REASON = (
  guildId: string,
  warnId: number,
  reason: string
) => {
  WarnModel.findOneAndUpdate({ guildId, warnId }, { reason })
    .then(() => {
      console.log('Updated warn with new reason');
    })
    .catch(() =>
      console.error(
        `Error on updating warn[${warnId}] with reason["${reason}"]`
      )
    );
};

/**
 * Grab all warnings of a user.
 * @param userId User ID to get warns of.
 */
export const GET_USER_WARNS = async (guildId: string, userId: string) => {
  return await WarnModel.find({ guildId, userId });
};

/**
 * Grab a single warn for a user.
 * @param userId User ID to get warn
 */
export const GET_USER_WARN = async (guildId: string, userId: string) => {
  return await WarnModel.findOne({ guildId, userId });
};

export const GET_WARN = async (guildId: string, warnId: number) => {
  return await WarnModel.findOne({ guildId, warnId });
};

export const SET_MAX_WARNS = async (guildId: string, maxWarns: number) => {
  return ConfigModel.findOneAndUpdate({ guildId }, { maxWarns });
};

/**
 * Set a guilds mod log channel.
 * @param guildId The guild to save config settings of.
 * @param modLog The mod channel id.
 */
export const SET_MOD_CHANNEL = (guildId: string, modLog: string) => {
  ConfigModel.findOneAndUpdate({ guildId }, { modLog }, (err) => {
    if (err) console.error(`Error on setting mod log channel.`);
  });
};

/**
 * Set a guilds server log channel.
 * @param guildId The guild to save config settings of.
 * @param serverLog The server channel id.
 */
export const SET_SERVER_CHANNEL = (guildId: string, serverLog: string) => {
  ConfigModel.findOneAndUpdate({ guildId }, { serverLog }, (err) => {
    if (err) console.error(`Error on setting server log channel.`);
  });
};

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
export const NEW_BANNED_WORD = (guildId: string, words: string[]) => {
  ConfigModel.findOneAndUpdate(
    { guildId },
    {
      $push: {
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
export const REMOVE_BANNED_WORD = (guildId: string, words: string[]) => {
  ConfigModel.findOneAndUpdate(
    { guildId },
    {
      $pull: {
        bannedWords: {
          $in: words,
        },
      },
    },
    (err) => {
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

export const SET_GUILD_PREFIX = async (guildId: string, prefix: string) => {
  return ConfigModel.findOneAndUpdate({ guildId }, { prefix });
};

export const SET_MUTE_ROLE = (guildId: string, muteRole: string) => {
  ConfigModel.findOneAndUpdate({ guildId }, { muteRole }, (err) => {
    if (err)
      return console.error(
        `Error on setting guilds[${guildId}] mute role[${muteRole}]`
      );
  });
};

export const SET_WARN_LIMIT = (guildId: string, maxWarns: number) => {
  ConfigModel.findOneAndUpdate({ guildId }, { maxWarns }).catch(() =>
    console.error(`Error on setting max warns for guild[${guildId}]`)
  );
};

export const SET_WARN_EXPIRE = async (
  guildId: string,
  warnLifeSpan: number
) => {
  return ConfigModel.findOneAndUpdate({ guildId }, { warnLifeSpan });
};

export const GET_GUILD_MUTES = async (guildId: string) => {
  return await MuteModel.find({ guildId });
};

export const MUTE_USER = (
  guildId: string,
  userId: string,
  dateMuted: number,
  unMuteDate: number
) => {
  MuteModel.create({ guildId, userId, dateMuted, unMuteDate }).catch(() =>
    console.error(`Error on muting user[${userId}] for guild[${guildId}]`)
  );
};

export const UPDATE_USER_MUTE = (
  guildId: string,
  userId: string,
  unMuteDate: number
) => {
  MuteModel.findOneAndUpdate({ guildId, userId }, { unMuteDate }).catch(() =>
    console.error(`Error on updating user[${userId}] mute time[${unMuteDate}]`)
  );
};

export const UNMUTE_USER = async (guildId: string, userId: string) => {
  return MuteModel.findOneAndDelete({ guildId, userId });
};

export const GET_USER_MUTE = async (guildId: string, userId: string) => {
  return await MuteModel.findOne({ guildId, userId });
};

export const GET_UNMUTED_USERS = async (guildId: string) => {
  const now = moment().unix();
  return MuteModel.find({
    guildId,
    unMuteDate: {
      $lt: now,
    },
  }).sort({ unMuteDate: 'asc' });
};
