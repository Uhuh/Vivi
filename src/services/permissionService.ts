import { Guild, GuildMember, TextChannel } from 'discord.js';
import { IGuildConfigDoc } from '../database/guild';

export class PermissionService {
  public static canManageGuild = (
    member: null | GuildMember,
    config: null | IGuildConfigDoc
  ): boolean => {
    return !!(
      member?.permissions.has(['MANAGE_GUILD']) ||
      member?.roles.cache.has(config?.modRole || '')
    );
  };

  public static checkChannelPerms(channel: TextChannel) {
    channel.guildId;
  }

  public static checkGuildPerms(guild: Guild) {
    const perms = [
      guild.me?.permissions.has('MANAGE_GUILD'),
      guild.me?.permissions.has('KICK_MEMBERS'),
      guild.me?.permissions.has('BAN_MEMBERS'),
      guild.me?.permissions.has('READ_MESSAGE_HISTORY'),
      guild.me?.permissions.has('SEND_MESSAGES'),
      guild.me?.permissions.has('MANAGE_MESSAGES'),
      guild.me?.permissions.has('EMBED_LINKS'),
      guild.me?.permissions.has('ATTACH_FILES'),
      guild.me?.permissions.has('ADD_REACTIONS'),
    ];
  }
}
