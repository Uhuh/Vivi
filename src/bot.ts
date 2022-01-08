import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import commandHandler from '../commands/commandHandler';
import msg from '../events/message';
import {
  GuildMemberUpdate,
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
import { AntiPhishService, PhishingBody } from './services/antiPhishService';
import { SelectService } from './services/selectService';
import { LogService } from './services/logService';

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
      LogService.logDebug(`[Started]: ${new Date()}\n`);
      LogService.logOk('Vivi reporting for duty!');
      // Post bot stats to top.gg
      setInterval(() => this.setBotPresence(), 10000);
      setInterval(() => this.checkMutes(), 60000); // 1 minute // 600000 = 10minutes
    });

    // Parse and filter every message for commands or if they're supposed to get warned.
    this.on('messageCreate', (message) => {
      if (message.author?.bot) return;

      // We can't really ban a user from their DMs or delete their messages.
      if (message.channel.type !== 'DM') {
        AntiPhishService.doesMessageContainPhishingLinks(message.content).then(
          (matches) => {
            if (!matches.trust_rating) return;
            this._warnService.phishingBan(matches as PhishingBody, message);
          }
        );
      }

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

    this.on('interactionCreate', (interaction) => {
      if (SelectService.isSelectMenu(interaction)) {
        SelectService.parseSelection(interaction, this);
      }
    });

    // Server events that get logged
    this.on('messageDelete', (message) => {
      try {
        if (message.author?.bot || message.channel?.type === 'DM') return;
        MessageDelete(message);
      } catch {
        LogService.logError(`Error on message delete!`);
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
        LogService.logError(`Error on message update!`);
      }
    });

    // Check if user is trying to remove mute role by rejoining.
    this.on('guildMemberAdd', (member) => {
      UserJoinRoles(member);
      MemberUpdated(member, 'join');
    });
    this.on('guildMemberRemove', (member) => MemberUpdated(member, 'left'));

    this.on('guildMemberUpdate', (oldMem, newMem) => {
      GuildMemberUpdate(oldMem, newMem);
    });

    // Make sure to generate the config when we join a new server.
    this.on('guildCreate', (guild) => {
      GENERATE_GUILD_CONFIG(guild.id);
    });

    // If a guild deletes a role try to delete from join list so there isn't a deleted role being added to users.
    this.on('roleDelete', (role) => {
      REMOVE_JOIN_ROLE(role.guild.id, role.id);
    });
  }

  setBotPresence = () => {
    const user = this.user;
    if (!user)
      return LogService.logError(
        `Couldn't find bot user when setting presence.`
      );

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
              .catch(() =>
                LogService.logError(
                  `Could not remove mute role from user[${member.id}]. Permission issue most likely.`
                )
              );

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
          LogService.logError(
            `Failed to get user to mute. Potentially not a user ID. [${userId}]`
          )
        );
      member = guild.members.cache.get(userId || '');
    }

    return member;
  }

  start = async () => {
    LogService.logInfo(`Starting up Vivi....`);
    LogService.logInfo(`Connecting to MongoDB: ${config.MONGODB}`);
    await mongoose.connect(
      `mongodb://${config.MONGODB}:27017/${config.DATABASE_TYPE}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    mongoose.set('useFindAndModify', false);
    LogService.logInfo(`Verifying bot token with Discord.`);
    await this.login(this.config.TOKEN);
    LogService.logInfo(`Loading banned words and prefixes.`);
    await Promise.all([this.loadBannedWords(), this.loadGuildPrefixes()]);
    LogService.logOk(`Started up correctly with zero issues.`);
  };
}
