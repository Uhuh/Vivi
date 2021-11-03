import { Message, TextChannel, User } from 'discord.js';
import moment = require('moment');
import ViviBot from '../bot';
import { CaseType } from '../database/cases';
import {
  GET_GUILD_CONFIG,
  GET_USER_WARNS,
  NEW_CASE,
} from '../database/database';
import { CLIENT_ID } from '../vars';
import { EmbedService } from './embedService';

export class WarnService {
  _client: ViviBot;

  constructor(client: ViviBot) {
    this._client = client;
  }

  filter = async (message: Message) => {
    const { guild } = message;

    if (!guild) return;
    /**
     * Loop through all the users words, check if they're in the banned list
     */
    const content = message.content;
    const words = this._client.bannedWords.get(guild.id);

    if (!words) return;
    for (const word of words) {
      const reg = new RegExp('\\b' + word + '\\b', 'g');
      const match = reg.exec(content);
      /**
       * Only get users warnings IF they match a banned word so that the bot doesn't query for each users warns
       * for every single message.
       */
      if (match) {
        let userWarnings = await GET_USER_WARNS(guild.id, message.author.id);
        const config = await GET_GUILD_CONFIG(guild.id);
        if (!config) return;

        if (!userWarnings) userWarnings = [];

        const WEEK_OLD = moment()
          .subtract(config.warnLifeSpan, 'days')
          .startOf('day');
        let activeWarns = 0;

        for (const warn of userWarnings) {
          if (moment(warn.creationDate).isBefore(WEEK_OLD)) continue;
          activeWarns++;
        }

        const id = match[0];

        activeWarns++;
        if (activeWarns > config.maxWarns!) {
          message.channel.send(
            `Banned ${message.author.username} for getting more than ${config.maxWarns} strikes.`
          );
          message
            .delete()
            .catch(() => console.error(`Issues deleting the message!`));

          await message.member
            ?.send(
              config.banMessage || `You've been banned from ${guild.name}.`
            )
            .catch(() =>
              console.error(
                'Issue sending ban appeal message to user. Oh well?'
              )
            );
          message.member
            ?.ban()
            .catch(() => message.channel.send(`Issues banning user.`));
          this.logIssue(
            guild.id,
            CaseType.ban,
            `Strike! You're out! (Banned word: ||${id}||)`,
            this._client.user || CLIENT_ID,
            message.author
          );
          return;
        } else {
          message.reply(
            `warning. You gained a warn. You have ${activeWarns}/${config.maxWarns} warns.`
          );

          this.logIssue(
            guild.id,
            CaseType.warn,
            `Warned for saying a banned word. ||${id}||`,
            this._client.user || CLIENT_ID,
            message.author
          );
          message.author
            .send(
              `You have been warned!\n**Reason:** Warned for saying a banned word. ${id}`
            )
            .catch(() =>
              console.error(`Can't DM user, probably has friends on.`)
            );
          message
            .delete()
            .catch(() => console.error(`Issues deleting the message!`));
        }
      }
    }
  };

  logIssue = async (
    guildId: string,
    type: CaseType,
    reason: string,
    mod: User | string,
    user: User | string,
    punishmentLength?: Date
  ) => {
    const config = await GET_GUILD_CONFIG(guildId);

    if (!config) {
      return console.error(
        `Failed to find guild[${guildId}] config while logging issue.`
      );
    } else if (!config.modLog) {
      return console.info(`No mod channel to log to.`);
    }

    const channel = this._client.getChannel(guildId, config.modLog);

    try {
      if (channel && channel instanceof TextChannel) {
        channel
          .send({
            embeds: [EmbedService.logEmbed(type, config, mod, user, reason)],
          })
          .then((m) => {
            NEW_CASE(
              guildId,
              typeof mod === 'string' ? mod : mod.id,
              typeof user === 'string' ? user : user.id,
              m.id,
              type,
              reason === '' || !reason
                ? `Mod please do \`${config.prefix}reason ${config.nextCaseId} <reason here>\``
                : reason,
              punishmentLength
            );
          });
      }
    } catch {
      console.error(`Issue when trying to write log case`);
    }
  };
}
