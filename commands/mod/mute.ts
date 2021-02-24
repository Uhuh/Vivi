import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import * as moment from 'moment';
import {
  GET_GUILD_CONFIG,
  GET_USER_MUTE,
  MUTE_USER,
} from '../../src/database/database';

const mute = {
  desc: 'Mute a user',
  name: 'mute',
  args: '<user id or mention> <reason> | [number {m,h,d,w,y}]',
  alias: ['m'],
  type: 'mod',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.hasPermission('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';
      return message.reply(
        `you forgot some arguements. Example usage: \`${prefix}mute <user id> Annoying! | 5m\``
      );
    }

    if (!config.muteRole) {
      return message.reply(
        `there is no mute role configured for this server. Try \`${config.prefix}config mute <@role/ID>\``
      );
    }

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId =
      message.mentions.members?.filter((u) => u.id !== client.user?.id).first()
        ?.id || args.shift();

    if (!userId) {
      return message.reply(`missing the user id argument!`);
    }

    const existingMute = await GET_USER_MUTE(guild.id, userId);

    if (existingMute) {
      return message.reply(`they're already muted. Check <#${config.modLog}>`);
    }

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    let user = message.guild?.members.cache.get(userId || '');
    // Try a fetch incase the user isn't cached.
    if (!user) {
      await message.guild?.members
        .fetch(userId || '')
        .catch(() =>
          console.error(
            `Failed to get user to mute. Potentially not a user ID. [${userId}]`
          )
        );
      user = message.guild?.members.cache.get(userId || '');
    }

    if (!user) {
      return message.reply(
        `couldn't find that user, check that the ID is correct.`
      );
    }

    const words =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    let [reason, time] = words.split('|').map((t) => t.trim());
    if (reason === '') reason = 'No reason provided.';

    // Default is infinite
    const now = moment().unix();
    let unmuteTime = moment().add(1, 'h').unix();

    if (time && time !== '') {
      const timeFormat = time[time.length - 1];
      const num = time.slice(0, -1);

      if (Number.isNaN(Number(num))) {
        return message.reply(`oops! That's not a number for time.`);
      }

      switch (timeFormat) {
        case 'm':
        case 'h':
        case 'd':
        case 'w':
        case 'y':
          unmuteTime = moment().add(Number(num), timeFormat).unix();
      }
    } else time = '1h';

    message.delete().catch(() => console.error(`Issues deleting mute message`));

    MUTE_USER(guild.id, userId, now, unmuteTime);

    client.logIssue(
      message.guild!.id,
      'mute',
      `${reason}\n\nMuted for ${time}`,
      message.author,
      user.user
    );
    message.channel.send(
      `<@${user.id}> You've been muted for \`${reason}\`. Duration is ${time}.`
    );
    /**
     * Mute user and set up timer to unmute them when the time is right.
     */
    user.roles
      .add(config.muteRole)
      .then(async () => {
        await user!
          .send(`You've been muted for \`${reason}\`. Duration is ${time}.`)
          .catch((e) =>
            console.error(
              `Guild[${guild.id}] - Issue sending mute reason to user. Oh well? ${e}\n`
            )
          );
      })
      .catch(() =>
        message.reply(`I was unable to give that user the mute role!`)
      );

    return;
  },
};

export default mute;
