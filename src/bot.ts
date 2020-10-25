import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import msg from '../events/message';
import * as config from './vars';
import commandHandler from '../commands/commandHandler';
import { GET_MUTES, REMOVE_MUTE } from './setup_tables';
import { MessageDelete, MessageEdit, UserJoin } from '../events/serverLogs';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import {
  CREATE_WARN,
  GET_BANNED_WORDS,
  GET_GUILD_CONFIG,
  GET_USER_WARNS,
  NEW_CASE,
} from './database/database';

interface Command {
  desc: string;
  name: string;
  args: string;
  type: string;
  run: Function;
}

// Discord embed sidebar colors.
enum COLOR {
  DEFAULT = 15158332,
  RED = 15158332,
  YELLOW = 15844367,
  GREEN = 3066993,
}

export default class ViviBot extends Discord.Client {
  config: any;
  commands: Discord.Collection<string, Command>;
  bannedWords: Discord.Collection<string, string[]>;
  mutes: Discord.Collection<string, NodeJS.Timeout>;
  caseCount: number = 0;
  muteRole = '756900919521837196';
  constructor(intents: Discord.WebSocketOptions) {
    super({ ws: intents });
    this.config = config;
    this.mutes = new Discord.Collection();
    this.commands = new Discord.Collection();
    this.bannedWords = new Discord.Collection();
    commandHandler(this);
    this.once('ready', () => {
      console.info(`[Started]: ${new Date()}\n`);
      console.info('Vivi reporting for duty!');
      setInterval(() => this.randomPres(), 10000);
    });

    //CMD Handling
    this.on('message', (message) => {
      if (message.author?.bot) return;
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
        MessageDelete(this, message);
      } catch {
        console.error(`Error on message delete!`);
      }
    });
    this.on('messageUpdate', (oldMsg, newMsg) => {
      try {
        if (oldMsg.author?.bot || oldMsg.channel?.type === 'dm') return;
        MessageEdit(this, oldMsg, newMsg);
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
    this.on('guildMemberAdd', (member) => UserJoin(member));
  }

  randomPres = () => {
    const user = this.user;
    if (!user) return console.log('Client dead?');

    const presArr = [`with dolphins`, `with food`];

    user
      .setPresence({
        activity: {
          name: presArr[Math.floor(Math.random() * presArr.length)],
          type: 'PLAYING',
        },
        status: 'online',
      })
      .catch(console.error);
  };

  verifyChannel = async (message: Discord.Message) => {
    const words = message.content.split(' ').join('').toLowerCase();

    message
      .delete()
      .catch(() => console.error(`Issue deleting verification message`));

    // If the user didn't send the verify message, ignore.
    if (!words.startsWith('bbverify')) return;

    const { guild } = message;

    if (!guild) return;

    let member = guild.members.cache.get(message.author.id);

    if (!member) {
      console.log(
        `Failed to get member from cache for verification. Going to fetch and retry....`
      );
      await guild.members.fetch(message.author.id);
      member = guild.members.cache.get(message.author.id);
    }

    if (!member) return console.error(`Issue getting member for verification.`);

    // Verify user into the server
    return member.roles
      .add(config.STUDENT_ROLE)
      .catch(() => console.error(`Issues verifying member.`));
  };

  filterWords = async (message: Discord.Message) => {
    const { guild } = message;

    if (!guild) return;
    /**
     * Loop through all the users words, check if they're in the banned list
     */
    const content = message.content.toLowerCase();
    for (const word of this.bannedWords) {
      const reg = new RegExp(`(\b${word}\b)`);
      const match = reg.exec(content);
      /**
       * Only get users warnings IF they match a banned word so that the bot doesn't query for each users warns
       * for every single message.
       */
      if (match) {
        let userWarnings = await GET_USER_WARNS(guild.id, message.author.id);

        if (!userWarnings) userWarnings = [];

        const WEEK_OLD = moment().subtract(8, 'days').startOf('day');
        let activeWarns = 0;

        for (const warn of userWarnings) {
          if (moment.unix(warn.date).isBefore(WEEK_OLD)) continue;
          activeWarns++;
        }

        const [, id] = match;
        activeWarns++;
        if (activeWarns > 3) {
          message.channel.send(
            `Banned ${message.author.username} for getting more than 3 strikes.`
          );
          message
            .delete()
            .catch(() => console.error(`Issues deleting the message!`));

          CREATE_WARN(
            message.guild!.id,
            message.author.id,
            this.user?.id || '731987022008418334',
            `Saying a banned word. ${id}`
          );

          await message.member
            ?.send(
              `
Your account has been terminated from our server automatically by me!
If you would like to appeal your account's termination, you may do so at \`https://forms.gle/vUNc5jDAGRopchFf6\`.

= = = Warn list = = =
${userWarnings.map((w) => `  - ID: ${w.id} | Reason: ${w.reason}\n`).join('')}

Thank you for your understanding.
`
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
            `Strike! You're out! (Banned word: ||${id}||)`,
            this.user!,
            message.author
          );
          return;
        } else {
          message.reply(
            `warning. You gained a strike. You have ${activeWarns}/3 strikes.`
          );

          CREATE_WARN(
            message.guild!.id,
            message.author.id,
            this.user?.id || '731987022008418334',
            `Saying a banned word. ${id}`
          );

          this.logIssue(
            guild.id,
            'warn',
            `Warned for saying a banned word. ||${id}||`,
            this.user!,
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
    type: 'mute' | 'warn' | 'ban' | 'kick',
    reason: string,
    mod: Discord.User,
    user: Discord.User | string,
    warnId?: string
  ) => {
    const config = await GET_GUILD_CONFIG(guildId);

    if (!config) {
      return console.error(
        `Failed to find guild[${guildId}] config while logging issue.`
      );
    } else if (!config.modLog) {
      return console.info(`No mod`);
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
          ? `Mod please do \`bbreason ${config.nextCaseId} <reason>\``
          : reason
      )
      .setColor(color)
      .setTimestamp(new Date());

    try {
      if (channel && channel instanceof Discord.TextChannel) {
        channel.send(embed).then((m) => {
          NEW_CASE(
            guildId,
            mod.id,
            typeof user === 'string' ? user : user.id,
            m.id,
            type,
            warnId || 'null'
          );
        });
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

  loadMutes = async () => {
    const mutes = GET_MUTES();
    const now = moment().unix();
    const guild = this.guilds.cache.get(this.config.GUILD);
    for (const mute of mutes) {
      let member = await guild?.members.cache.get(mute.user_id);
      if (!member) {
        console.log(
          `Failed to get member from cache for MUTE. Going to fetch and retry....`
        );
        await guild?.members
          .fetch(mute.user_id)
          .catch(() =>
            console.error(`Error fetching user. Most likely not in the server.`)
          );
        member = guild?.members.cache.get(mute.user_id);
      }

      this.mutes.set(
        mute.user_id,
        setTimeout(() => {
          this.mutes.delete(mute.user_id);
          REMOVE_MUTE(mute.user_id);
          this.logIssue(
            'AutoMod: Unmute',
            `Time's up`,
            this.user!,
            member ? member.user : mute.user_id
          );

          if (member) {
            member.roles
              .remove(this.muteRole)
              .catch(() =>
                console.error(
                  `Unable to remove mute role from member. Maybe they left?`
                )
              );
          }
        }, (Number(mute.unmute_date) - now) * 1000)
      );
    }
  };

  async start() {
    await mongoose.connect('mongodb://localhost/database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    await this.login(this.config.TOKEN);
    await this.loadBannedWords();
    await this.loadMutes();
  }
}
