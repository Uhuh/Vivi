import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import * as moment from 'moment';
import { GET_GUILD_CONFIG, GET_USER_MUTE } from '../../src/database/database';
import { getUserId } from '../../utilities/functions/getUserId';
import { CaseType } from '../../src/database/cases';

enum timeForm {
  h = 'hour',
  w = 'week',
  m = 'minute',
  d = 'day',
  y = 'year',
}

type timeFormStrings = keyof typeof timeForm;

export const mute = {
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
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      const prefix = config.prefix || 'v.';
      return message.reply(
        `you forgot some arguements. Example usage: \`${prefix}mute <user id> Annoying! | 5m\``
      );
    }

    if (!config.muteRole) {
      return message.reply(
        `there is no mute role configured for this server. Try \`${config.prefix}config mute-role <@role/ID>\``
      );
    }

    const userId = getUserId(message, args);

    if (!userId) {
      return message.reply(`missing the user id argument!`);
    }

    const existingMute = await GET_USER_MUTE(guild.id, userId);

    if (existingMute) {
      return message.reply(
        `they're already muted.${
          config.modLog ? ` Check <#${config.modLog}>` : ''
        }`
      );
    }

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    let member = await ViviBot.getGuildMember(guild, userId);

    if (!member) {
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

    let unmuteTime = moment().add(1, 'h').toDate();

    if (time && time !== '') {
      const timeFormat = time[time.length - 1];
      const num = time.slice(0, -1);

      if (Number.isNaN(Number(num))) {
        return message.reply(`oops! That's not a number for time.`);
      } else if (Number(num) < 1) {
        return message.reply(`please return a time at least 1 or greater.`);
      }

      switch (timeFormat) {
        case 'm':
        case 'h':
        case 'd':
        case 'w':
        case 'y':
          unmuteTime = moment().add(Number(num), timeFormat).toDate();
          break;
        default:
          time = '1h';
      }
    } else time = '1h';

    let key = time[time.length - 1] as timeFormStrings;

    if (!key) key = 'h';

    const num = Number(time.slice(0, -1));
    const muteDuration = `${num} ${
      num > 1 ? timeForm[key] + 's' : timeForm[key]
    }`;

    member.roles
      .add(config.muteRole)
      .then(async () => {
        if (!member) return;

        client._warnService.logIssue(
          guild.id,
          CaseType.mute,
          `${reason}\n\nMuted for ${muteDuration}`,
          message.author,
          member.user,
          unmuteTime
        );

        message.channel.send(
          `<@${member.id}> You've been muted for \`${reason}\`. Duration is ${muteDuration}.`
        );

        await member
          .send(
            `You've been muted for \`${reason}\`. Duration is ${muteDuration}. You will be unmuted <t:${moment(
              unmuteTime
            ).unix()}:R>`
          )
          .catch((e) =>
            console.error(
              `Guild[${guild.id}] - Issue sending mute reason to user. Oh well? ${e}\n`
            )
          );
      })
      .catch(() => {
        message.reply(`I was unable to give that user the mute role!`);
        console.log(config.muteRole);
      });

    return;
  },
};
