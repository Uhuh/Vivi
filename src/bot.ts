import * as Discord from 'discord.js';
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
  GENERATE_GUILD_CONFIG,
  GET_BANNED_WORDS,
  GET_CASES_PASSED_PUNISHMENTDATE,
  GET_GUILD_CONFIG,
  REMOVE_JOIN_ROLE,
  UNMUTE_USER,
} from './database/database';
import * as config from './vars';
import { Command } from '../utilities/types/commands';
import { WarnService } from './services/warnService';
import { CaseType } from './database/cases';

export default class ViviBot extends Discord.Client {
  config: any;
  _warnService: WarnService;
  commands: Discord.Collection<string, Command>;
  bannedWords: Discord.Collection<string, string[]>;
  guildPrefix: Discord.Collection<string, string>;
  constructor() {
    super({
      intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
      ],
    });

    this.config = config;

    this._warnService = new WarnService(this);

    this.commands = new Discord.Collection();
    this.bannedWords = new Discord.Collection();
    this.guildPrefix = new Discord.Collection();
    // Load all the commands into the clients commands var.
    commandHandler(this);

    this.once('ready', () => {
      console.info(`[Started]: ${new Date()}\n`);
      console.info('Vivi reporting for duty!');
      // Post bot stats to top.gg
      setInterval(() => this.setBotPresence(), 10000);
      setInterval(() => this.checkMutes(), 60000); // 1 minute // 600000 = 10minutes
    });

    //CMD Handling
    this.on('messageCreate', (message) => {
      if (message.author?.bot) return;
      msg(this, message as Discord.Message);
      // Verify user message into the server.
      if (
        message.channel?.type !== 'DM' &&
        !message.member?.permissions.has('MANAGE_MESSAGES')
      ) {
        this._warnService.filter(message as Discord.Message);
      }

      return;
    });
    this.on('messageDelete', (message) => {
      try {
        if (message.author?.bot || message.channel?.type === 'DM') return;
        MessageDelete(message);
      } catch {
        console.error(`Error on message delete!`);
      }
    });
    this.on('messageUpdate', (oldMsg, newMsg) => {
      try {
        if (oldMsg.author?.bot || oldMsg.channel?.type === 'DM') return;
        MessageEdit(oldMsg, newMsg);
        if (
          newMsg.channel?.type !== 'DM' &&
          !newMsg.author?.bot &&
          !newMsg.member?.permissions.has('MANAGE_MESSAGES')
        ) {
          this._warnService.filter(newMsg as Discord.Message);
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
    this.on('guildCreate', (guild) => {
      GENERATE_GUILD_CONFIG(guild.id);
    });
    this.on('roleDelete', (role) => {
      REMOVE_JOIN_ROLE(role.guild.id, role.id);
    });
  }

  setBotPresence = () => {
    const user = this.user;
    if (!user) return console.log('Client dead?');

    user.setPresence({
      activities: [
        {
          name: '@Vivi help',
          type: 'WATCHING',
        },
      ],
      status: 'online',
    });
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
      const mutes = await GET_CASES_PASSED_PUNISHMENTDATE(id, CaseType.mute);
      for (const m of mutes) {
        try {
          await guild.members.fetch(m.userId);
          const member = guild.members.cache.get(m.userId);
          if (member) {
            member.roles
              .remove(config.muteRole)
              .catch(() => console.error(`Permission issue.`));

            this._warnService.logIssue(
              id,
              CaseType.unmute,
              'Times up.',
              this.user || 'Vivi',
              member.user
            );
          }
          UNMUTE_USER(id, m.userId);
        } catch {
          /**
           * If the member left the server execute this instead.
           */
          this._warnService.logIssue(
            id,
            CaseType.unmute,
            'Times up.',
            this.user || 'Vivi',
            m.userId
          );
          UNMUTE_USER(id, m.userId);
        }
      }
    }
  };

  /**
   * Try to find a guild channel within the cache for a specific guild.
   * @param guildId Guild to get channels from.
   * @param channelId The channel to grab, will most likely be modlog/server log.
   * @returns GuildChannel | undefined
   */
  public getChannel(guildId: string, channelId: string) {
    return this.guilds.cache.get(guildId)?.channels.cache.get(channelId);
  }

  /**
   * Sometimes guildmembers aren't cached, call this to get them and it will make sure to cache them incase.
   * @param guild Guild object with cached members
   * @param userId User ID of the user we want to get.
   * @returns GuildMember or undefined
   */
  public static async getGuildMember(
    guild: Discord.Guild,
    userId: string | undefined
  ): Promise<Discord.GuildMember | undefined> {
    let member = guild.members.cache.get(userId || '');
    // Try a fetch incase the user isn't cached.
    if (!member) {
      await guild.members
        .fetch(userId || '')
        .catch(() =>
          console.error(
            `Failed to get user to mute. Potentially not a user ID. [${userId}]`
          )
        );
      member = guild.members.cache.get(userId || '');
    }

    return member;
  }

  start = async () => {
    await mongoose.connect(
      `mongodb://${config.MONGODB}:27017/${config.DATABASE_TYPE}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    mongoose.set('useFindAndModify', false);
    await this.login(this.config.TOKEN);
    await Promise.all([this.loadBannedWords(), this.loadGuildPrefixes()]);
  };
}
