import { Guild, MessageEmbed, User } from 'discord.js';
import ViviBot from '../../src/bot';
import { Category } from '../../utilities/types/commands';
import { COLOR } from '../../utilities/types/global';
import { CaseType } from '../database/cases';
import { IGuildConfigDoc } from '../database/guild';

export class EmbedService {
  constructor() {}

  private static userTagInfo = (user: User | string): string => {
    return `${typeof user === 'string' ? user : user?.tag} (<@${
      typeof user === 'string' ? user : user.id
    }>)`;
  };

  public static logEmbed = (
    type: CaseType,
    config: IGuildConfigDoc,
    mod: User | string,
    user: User | string,
    reason: string
  ): MessageEmbed => {
    const embed = new MessageEmbed();

    let color = COLOR.DEFAULT;
    switch (type) {
      case CaseType.warn:
        color = COLOR.DEFAULT;
        break;
      case CaseType.ban:
        color = COLOR.RED;
        break;
      case CaseType.mute:
      case CaseType.kick:
        color = COLOR.YELLOW;
        break;
      default:
        // The rest are undo's.
        color = COLOR.GREEN;
        break;
    }

    embed
      .setTitle(`${CaseType[type]} | Case #${config.nextCaseId}`)
      .addField(`**User**`, this.userTagInfo(user), true)
      .addField(`**Moderator**`, this.userTagInfo(mod), true)
      .addField(
        `**Reason**`,
        reason === '' || !reason
          ? `Mod please do \`${config.prefix}reason ${config.nextCaseId} <reason here>\``
          : reason
      )
      .setColor(color)
      .setTimestamp(new Date());

    return embed;
  };

  public static configHelpEmbed = (
    client: ViviBot,
    config: IGuildConfigDoc
  ) => {
    const embed = new MessageEmbed();
    embed
      .setTitle('**Config commands**')
      .setDescription(`All config commands require MANAGE_GUILD permissions.`)
      .setColor(COLOR.AQUA)
      .setAuthor(
        client.user?.username || 'Vivi',
        client.user?.avatarURL() || ''
      )
      .setThumbnail(client.user?.avatarURL() || '')
      .setFooter(`Config help :)`)
      .setTimestamp(new Date());

    client.commands
      .filter((c) => c.type === Category.config)
      .forEach((func) =>
        embed.addField(
          `**${config.prefix}config ${func.name} ${func.args}**`,
          func.desc
        )
      );

    return embed;
  };

  public static guildConfigEmbed = (guild: Guild, config: IGuildConfigDoc) => {
    const embed = new MessageEmbed();
    embed
      .setColor(COLOR.AQUA)
      .setTitle(`Configuration for **${guild.name}**`)
      .setThumbnail(guild.iconURL() || '')
      .addField('Guild prefix:', `\`${config.prefix}\``, true)
      .addField('Warns expire after:', `${config.warnLifeSpan} days`, true)
      .addField('Max warns before banning:', `${config.maxWarns}`, true)
      .addField(
        'Mod logging channel:',
        config.modLog ? `<#${config.modLog}>` : 'Not set!',
        true
      )
      .addField(
        'Server logging channel:',
        config.serverLog ? `<#${config.serverLog}>` : 'Not set!',
        true
      )
      .addField(
        'Welcome channel:',
        config.welcomeChannel ? `<#${config.welcomeChannel}>` : 'Not set!',
        true
      )
      .addField(
        'Mute role:',
        `${
          config.muteRole
            ? guild.roles.cache.get(config.muteRole) || 'Not set!'
            : 'Not set!'
        }`,
        true
      )
      .addField(
        'Mod role:',
        `${
          config.modRole
            ? guild.roles.cache.get(config.modRole) || 'Not set!'
            : 'Not set!'
        }`,
        true
      )
      .addField(
        'Current amount of mod cases:',
        `${config.nextCaseId! - 1}`,
        true
      )
      .addField(
        'Whitelisted channels:',
        `${
          config.serverLogWhitelist?.length
            ? config.serverLogWhitelist?.map((c) => `<#${c}>`)
            : 'None!'
        }`
      )
      .addField(
        'Ban message:',
        config.banMessage || `You've been banned from ${guild.name}.`
      );

    return embed;
  };
}
