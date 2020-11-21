import * as Discord from 'discord.js';
import { GET_GUILD_CONFIG, GET_USER_MUTE } from '../src/database/database';

// Discord Message
type DMsg = Discord.Message | Discord.PartialMessage;

export const UserJoin = async (
  member: Discord.GuildMember | Discord.PartialGuildMember
) => {
  if (!member.guild) return;
  const config = await GET_GUILD_CONFIG(member.guild.id);
  if (!config?.muteRole) return;
  const user = await GET_USER_MUTE(member.guild.id, member.id);
  if (user) {
    member.roles
      ?.add(config?.muteRole)
      .catch(() => console.error(`Couldn't mute the user on join.`));
  } else if (member instanceof Discord.GuildMember) {
    /* member.send(
      `Welcome to the Love Letter community!\nPlease wait 10 minutes until I can help you get verified. In the meantime make sure to read the <#732961554005229639> and look at the <#729135006018175077>.`
    ).catch(() => console.error(`Couldn't DM user welcome message.`)); */
  }
};

export const MessageDelete = async (message: DMsg) => {
  if (!message.guild) return;
  const embed = new Discord.MessageEmbed();
  const config = await GET_GUILD_CONFIG(message.guild.id);
  /**
   * If there is no server log configured ignore.
   * If the guild whitelisted the channel ignore it.
   */
  if (
    !config?.serverLog ||
    config.serverLogWhitelist?.includes(message.channel!.id)
  )
    return;

  const channel = message.guild.channels.cache.get(
    config?.serverLog
  ) as Discord.TextChannel;

  if (message.attachments?.size) {
    for (const [, att] of message.attachments) {
      channel.send(att.proxyURL);
    }
  }
  embed
    .setTitle('**Message Deleted**')
    .setAuthor(message.author?.tag, message.author?.avatarURL() || '')
    .setDescription(message.content === '' ? 'Vivi: Empty' : message.content)
    .addField(
      '**---**',
      `**Message author:** <@${message.author?.id}>\n**Channel:** <#${message.channel?.id}>`
    )
    .setFooter(`ID: ${message.id}`)
    .setTimestamp(new Date());

  channel.send(embed);
};

export const MessageEdit = async (oldMsg: DMsg, newMsg: DMsg) => {
  if (!oldMsg.guild || oldMsg.content === newMsg.content) return;
  const embed = new Discord.MessageEmbed();
  const config = await GET_GUILD_CONFIG(oldMsg.guild.id);
  /**
   * If there is no server log configured ignore.
   * If the guild whitelisted the channel ignore it.
   */
  if (
    !config?.serverLog ||
    config.serverLogWhitelist?.includes(oldMsg.channel!.id)
  )
    return;

  const channel = oldMsg.guild.channels.cache.get(
    config?.serverLog
  ) as Discord.TextChannel;

  embed
    .setTitle('**Message Edited**')
    .setAuthor(newMsg.author?.tag, newMsg.author?.avatarURL() || '')
    .setDescription(
      (oldMsg?.content === '' ? 'Vivi: Empty!' : oldMsg.content) ||
        'Vivi: Empty!'
    )
    .setFooter(`ID: ${newMsg.id}`)
    .setTimestamp(new Date());

  const content = newMsg.content || 'Vivi: Empty!';

  for (const line of split(content, 1024)) {
    embed.addField(`**After edit**`, line);
  }

  embed.addField(
    '**---**',
    `**Message author:** <@${newMsg.author?.id}>\n**Channel:** <#${newMsg.channel?.id}>\n[Jump to message](${newMsg.url})`
  );

  channel.send(embed);
};

function split(input: string, len: number): string[] {
  return (
    input.match(
      new RegExp(
        '.{1,' + len + '}(?=(.{' + len + '})+(?!.))|.{1,' + len + '}$',
        'g'
      )
    ) || [input]
  );
}
