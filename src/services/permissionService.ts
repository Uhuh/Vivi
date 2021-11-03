import { GuildMember } from 'discord.js';
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
}
