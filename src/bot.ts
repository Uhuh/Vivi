import * as Discord from 'discord.js';
import * as DBL from 'dblapi.js';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import commandHandler from '../commands/commandHandler';
import msg from '../events/message';
import {
  MemberUpdated,
  MessageDelete,
  MessageEdit,
  UserJoinRoles,
} from '../events/serverLogs';
import {
  ALL_GUILD_PREFIXES,
  CREATE_WARN,
  GENERATE_GUILD_CONFIG,
  GET_BANNED_WORDS,
  GET_GUILD_CONFIG,
  GET_UNMUTED_USERS,
  GET_USER_WARNS,
  NEW_CASE,
  REMOVE_JOIN_ROLE,
  UNMUTE_USER,
} from './database/database';
import * as config from './vars';
import { Command } from '../utilities/types/commands';
import { COLOR } from '../utilities/types/global';

export default class ViviBot extends Discord.Client {
  config: any;
  commands: Discord.Collection<string, Command>;
  bannedWords: Discord.Collection<string, string[]>;
  guildPrefix: Discord.Collection<string, string>;
  constructor(intents: Discord.WebSocketOptions) {
    super({ ws: intents });
    this.config = config;
    this.commands = new Discord.Collection();
    this.bannedWords = new Discord.Collection();
    this.guildPrefix = new Discord.Collection();
    // Load all the commands into the clients commands var.
    commandHandler(this);

    this.once('ready', () => {
      const dblapi = new DBL(this.config.DBLTOKEN, this);
      console.info(`[Started]: ${new Date()}\n`);
      console.info('Vivi reporting for duty!');
      // Post bot stats to top.gg
      setInterval(() => dblapi.postStats(this.guilds.cache.size), 1800000);
      setInterval(() => this.randomPres(), 10000);
      setInterval(() => this.checkMutes(), 60000); // 1 minute // 600000 = 10minutes
    });

    //CMD Handling
    this.on('message', (message) => {
      if (message.author?.bot) return;

      /* if (message.channel.type === 'dm') {
        /**
         {
            user_id: '',
            guild_id: '',
            captcha: '',
            verified_role: '',
            created_at: '',
            attempts: 0
          }
        
        const userCaptcha = this.pendingCaptchas.get(message.author.id);

        if (message.content === userCaptcha.captcha) {
          return this.verifyUserCaptcha(userCaptcha);
        }

        userCaptcha.attempts++;
        if (userCaptcha.attempts === 3) {
          this.pendingCaptchas.delete(userCaptcha.user_id);
          return message.reply(`you failed the captcha. Try again.`);
        }

        this.pendingCaptchas.set(userCaptcha.user_id, userCaptcha);
      } */

      msg(this, message as Discord.Message);
      // Verify user message into the server.
      if (
        message.channel?.type !== 'dm' &&
        !message.member?.hasPermission('MANAGE_MESSAGES')
      ) {
        this.filterWords(message as Discord.Message);
      }

      return;
    });
    this.on('messageDelete', (message) => {
      try {
        if (message.author?.bot || message.channel?.type === 'dm') return;
        MessageDelete(message);
      } catch {
        console.error(`Error on message delete!`);
      }
    });
    this.on('messageUpdate', (oldMsg, newMsg) => {
      try {
        if (oldMsg.author?.bot || oldMsg.channel?.type === 'dm') return;
        MessageEdit(oldMsg, newMsg);
        if (
          newMsg.channel?.type !== 'dm' &&
          !newMsg.author?.bot &&
          !newMsg.member?.hasPermission('MANAGE_MESSAGES')
        ) {
          this.filterWords(newMsg as Discord.Message);
        }
      } catch {
        console.error(`Error on message update!`);
      }
    });
    this.on('guildMemberAdd', (member) => {
      UserJoinRoles(member);
      MemberUpdated(member, 'join');
    });
    this.on('guildMemberRemove', (member) => MemberUpdated(member, 'left'));
    this.on('guildCreate', ({ id }) => GENERATE_GUILD_CONFIG(id));
    this.on('roleDelete', (role) => REMOVE_JOIN_ROLE(role.guild.id, role.id));
  }

  randomPres() {
    const user = this.user;
    if (!user) return console.log('Client dead?');

    user
      .setPresence({
        activity: {
          name: '@Vivi help',
          type: 'WATCHING',
        },
        status: 'online',
      })
      .catch(console.error);
  }

  async filterWords(message: Discord.Message) {
    const { guild } = message;

    if (!guild) return;
    /**
     * Loop through all the users words, check if they're in the banned list
     */
    const content = message.content;
    const words = this.bannedWords.get(guild.id);

    if (!words) return;
    for (const word of words) {
      const match = content.toLowerCase().includes(word);
      /**
       * Only get users warnings IF they match a banned word so that the bot doesn't query for each users warns
       * for every single message.
       */
      if (match) {
        let userWarnings = await GET_USER_WARNS(guild.id, message.author.id);
        const config = await GET_GUILD_CONFIG(guild.id);
        if (!config || message.member?.roles.cache.has(config.modRole || ''))
          return;

        if (!userWarnings) userWarnings = [];

        const WEEK_OLD = moment()
          .subtract(config.warnLifeSpan, 'days')
          .startOf('day');
        let activeWarns = 0;

        for (const warn of userWarnings) {
          if (moment.unix(warn.date).isBefore(WEEK_OLD)) continue;
          activeWarns++;
        }

        activeWarns++;
        if (activeWarns > config.maxWarns!) {
          message.channel.send(
            `Banned ${message.author.username} for getting more than ${config.maxWarns} warns.`
          );
          message
            .delete()
            .catch(() => console.error(`Issues deleting the message!`));

          CREATE_WARN(
            guild.id,
            message.author.id,
            this.user?.id || '731987022008418334',
            `Saying a banned word. (Matched ${word})`
          );

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
            'ban',
            `Strike! You're out! (Banned word matched: ||${word}||)`,
            this.user!,
            message.author
          );
          return;
        } else {
          message.reply(
            `warning. You gained a warn. You have ${activeWarns}/${config.maxWarns} warns.`
          );

          CREATE_WARN(
            message.guild!.id,
            message.author.id,
            this.user?.id || '731987022008418334',
            `Saying a banned word. Matched: ${word}`
          );

          this.logIssue(
            guild.id,
            'warn',
            `Warned for saying a banned word. Matched: ||${word}||`,
            this.user!,
            message.author,
            config.nextWarnId
          );
          message.author
            .send(
              `You have been warned!\n**Reason:** Warned for saying a banned word. Matched: ${word}`
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
  }

  logIssue = async (
    guildId: string,
    type: 'mute' | 'warn' | 'ban' | 'kick' | 'unban' | 'unmute' | 'unwarn',
    reason: string,
    mod: Discord.User,
    user: Discord.User | string,
    warnId?: number
  ) => {
    const config = await GET_GUILD_CONFIG(guildId);

    if (!config) {
      return console.error(
        `Failed to find guild[${guildId}] config while logging issue.`
      );
    } else if (!config.modLog) {
      return;
    }

    const embed = new Discord.MessageEmbed();
    const channel = this.guilds.cache
      .get(guildId)
      ?.channels.cache.get(config.modLog);

    let color = COLOR.DEFAULT;
    switch (type.toLowerCase()) {
      case 'ban':
        color = COLOR.RED;
        break;
      case 'mute':
        color = COLOR.YELLOW;
        break;
      case 'unmute':
      case 'unban':
      case 'unwarn':
        color = COLOR.GREEN;
        break;
    }

    embed
      .setTitle(`${type} | Case #${config.nextCaseId}`)
      .addField(
        `**User**`,
        `${typeof user === 'string' ? user : user?.tag} (<@${
          typeof user === 'string' ? user : user.id
        }>)`,
        true
      )
      .addField(`**Moderator**`, mod?.tag === '' ? 'Unknown' : mod.tag, true)
      .addField(
        `**Reason**`,
        reason === ''
          ? `Mod please do \`${config.prefix}reason ${config.nextCaseId} <reason>\``
          : reason
      )
      .setColor(color)
      .setTimestamp(new Date());

    try {
      if (channel && channel instanceof Discord.TextChannel) {
        channel
          .send(embed)
          .then((m) => {
            NEW_CASE(
              guildId,
              mod.id,
              typeof user === 'string' ? user : user.id,
              m.id,
              type,
              warnId
            );
          })
          .catch(() =>
            console.error(
              `Failed to send case embed to mod channel[${config.modLog}] for guild[${config.guildId}]`
            )
          );
      }
    } catch {
      console.error(`Issue when trying to write log case`);
    }
  };

  loadBannedWords = async () => {
    for (const [id] of this.guilds.cache) {
      this.bannedWords.set(id, await GET_BANNED_WORDS(id));
    }
  };

  loadGuildPrefixes = async () => {
    const guilds = await ALL_GUILD_PREFIXES();
    for (const g of guilds) {
      this.guildPrefix.set(g.guildId, g.prefix || 'v.');
    }
  };

  /**
   * Check every guild muted members and remove mute roles from them.
   * Probably only check this every 10 minutes.
   */
  checkMutes = async () => {
    for (const [id, guild] of this.guilds.cache) {
      const config = await GET_GUILD_CONFIG(id);
      // If the server mute role is not configured, ignore.
      // Not sure how they muted without it.
      if (!config?.muteRole) continue;
      const mutes = await GET_UNMUTED_USERS(id);
      for (const m of mutes) {
        try {
          await guild.members.fetch(m.userId);
          const member = guild.members.cache.get(m.userId);
          if (member) {
            member.roles.remove(config.muteRole).catch();
            this.logIssue(id, 'unmute', 'Times up.', this.user!, member.user);
          }
          UNMUTE_USER(id, m.userId);
        } catch {
          /**
           * If the member left the server execute this instead.
           */
          this.logIssue(id, 'unmute', 'Times up.', this.user!, m.userId);
          UNMUTE_USER(id, m.userId);
        }
      }
    }
  };

  start = async () => {
    await mongoose.connect(`mongodb://localhost/${config.DATABASE_TYPE}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    mongoose.set('useFindAndModify', false);
    await this.login(this.config.TOKEN);
    await Promise.all([this.loadBannedWords(), this.loadGuildPrefixes()]);
  };
}
