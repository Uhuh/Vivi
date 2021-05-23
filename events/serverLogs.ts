import * as Discord from 'discord.js';
import * as Canvas from 'canvas';
import {
  GET_GUILD_CONFIG,
  GET_USER_MUTE,
  GUILD_JOIN_ROLES,
} from '../src/database/database';
import { IGuildConfigDoc } from '../src/database/guildConfig';
import * as moment from 'moment';
import { BannerDims } from '../utilities/objects/bannerDimensions';

// Discord Message
type DMsg = Discord.Message | Discord.PartialMessage;

export enum Color {
  Green = '#008E44',
  Red = '#A62019',
  MustardYellow = '#F8C300',
  DarkOrange = '#CC7900',
}

export const UserJoinRoles = async (
  member: Discord.GuildMember | Discord.PartialGuildMember
) => {
  if (!member.guild) return;
  const config = await GET_GUILD_CONFIG(member.guild.id);
  const joinRoles = await GUILD_JOIN_ROLES(member.guild.id);

  const user = await GET_USER_MUTE(member.guild.id, member.id);
  if (user && config?.muteRole) {
    member.roles
      ?.add(config?.muteRole)
      .catch(() => console.error(`Couldn't mute the user on join.`));
  }
  for (const role of joinRoles?.joinRoles || []) {
    member.roles
      ?.add(role)
      .catch(() => console.error(`Couldn't give join role to user.`));
  }

  /**
   * Whenever a user joins let's see if the server has the welcome banner.
   */
  userBanner(member, config);
};

/**
 * Whenever a user joins or leaves a guild log it to the guilds server logs.
 * @param member The user that joined or left the guild.
 * @param type join | leave - If a user join or left a guild.
 */
export const MemberUpdated = async (
  member: Discord.GuildMember | Discord.PartialGuildMember,
  type: 'join' | 'left'
) => {
  if (!member.guild) return;
  const config = await GET_GUILD_CONFIG(member.guild.id);
  const color = type === 'join' ? Color.Green : Color.Red;

  /**
   * If there is no server log configured ignore.
   */
  if (!config?.serverLog) return;

  const channel = member.guild.channels.cache.get(
    config?.serverLog
  ) as Discord.TextChannel;

  if (!channel) return;

  const embed = new Discord.MessageEmbed();

  embed
    .setTitle(`**Member ${type}**`)
    .setColor(color)
    .setThumbnail(
      member.user?.avatarURL() ||
        'https://cdn.discordapp.com/embed/avatars/0.png'
    )
    .addField('Member', member, true)
    .setFooter(`ID: ${member.id} | ${member.guild.memberCount} members`)
    .setTimestamp(new Date())
    .addField('**Created**', member.user?.createdAt.toDateString(), true)
    .addField('**Username**', member.user?.tag, true)
    .addField('**ID**', member.user?.id);

  if (type === 'join') {
    const userMomentObject = moment(member.user?.createdTimestamp);
    const days = moment().diff(userMomentObject, 'days');
    let description = '';

    if (days < 30) {
      const sinceDate = userMomentObject.fromNow();
      description += `New account alert: ${sinceDate}`;
    }
    if (!member.user?.avatarURL()) {
      description = description ? description + '\n' : '';
      description += 'Default avatar';
    }

    if (description !== '') {
      embed.setDescription(`\`\`\`${description}\`\`\``);
    }
  }

  channel
    .send(embed)
    .catch(() =>
      console.error(
        `Failed to send member updated message for guild[${member.guild.id}]`
      )
    );
};

/**
 * Whenever a message is deleted in a guild log to server logs.
 * @param message Deleted message
 */
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

  if (!channel) return;

  message.attachments.forEach((att) => embed.attachFiles([att.proxyURL]));

  embed
    .setTitle('**Message Deleted**')
    .setColor(Color.MustardYellow)
    .setAuthor(message.author?.tag, message.author?.avatarURL() || '')
    .setDescription(message.content === '' ? 'Vivi: Empty' : message.content)
    .addField(
      '**---**',
      `**Message author:** <@${message.author?.id}>\n**Channel:** <#${message.channel?.id}>`
    )
    .setFooter(`ID: ${message.id}`)
    .setTimestamp(new Date());

  channel
    .send(embed)
    .catch(() =>
      console.error(
        `Failed to send message deleted event for guild[${message.guild?.id}]`
      )
    );
};

/**
 * Whenever a message is edited log to server logs.
 * @param oldMsg Old message content.
 * @param newMsg New edited message.
 */
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

  if (!channel) return;

  embed
    .setTitle('**Message Edited**')
    .setColor(Color.DarkOrange)
    .setAuthor(newMsg.author?.tag, newMsg.author?.avatarURL() || '')
    .setDescription(
      (oldMsg?.content === '' ? 'Vivi: Empty!' : oldMsg.content) ||
        'Vivi: Empty!'
    )
    .setFooter(`ID: ${newMsg.id}`)
    .setTimestamp(new Date());

  const content = newMsg.content || 'Vivi: Empty!';
  const splitContent = split(content);
  embed.addField(`**After edit**`, splitContent[0]);
  for (let i = 1; i < splitContent.length; i++) {
    embed.addField('-', splitContent[i]);
  }

  embed.addField(
    '**---**',
    `**Message author:** <@${newMsg.author?.id}>\n**Channel:** <#${newMsg.channel?.id}>\n[Jump to message](${newMsg.url})`
  );

  channel
    .send(embed)
    .catch(() =>
      console.error(
        `Failed to send message edit event for guild[${newMsg.guild?.id}]`
      )
    );
};

function split(input: string): string[] {
  return input.match(/.{1,1024}/g) || [input];
}

export const userBanner = async (
  member: Discord.GuildMember | Discord.PartialGuildMember,
  config: IGuildConfigDoc | null
) => {
  // If the channel isn't there then obviously ignore.
  if (!config?.welcomeChannel) return;
  const channel = member.guild.channels.resolve(
    config.welcomeChannel
  ) as Discord.TextChannel;

  // If the channel doesn't exist ignore it.
  if (!channel) {
    return console.error(
      `Cannot get channel for user banner on guild[${member.guild.id}]`
    );
  }

  const canvas = Canvas.createCanvas(700, 350);
  const ctx = canvas.getContext('2d');
  let banner = BannerDims.left;
  if (config.bannerType === 'center') banner = BannerDims.center;

  Canvas.registerFont('assets/fonts/Inter-SemiBold.ttf', { family: 'Inter' });

  const background = await Canvas.loadImage(
    `assets/images/${config.bannerType}-banner.png`
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.font = '28px Inter';
  if (config.bannerType === 'center') ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Welcome to the server,', banner.text.msg.x, banner.text.msg.y);

  ctx.font = applyText(canvas, member?.user?.tag || 'Unknown', banner);
  if (config.bannerType === 'center') ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    member?.user?.tag || 'Unknown',
    banner.text.user.x,
    banner.text.user.y
  );

  ctx.beginPath();
  ctx.arc(banner.circle.x, banner.circle.y, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(
    member?.user?.displayAvatarURL({ format: 'png', size: 512 }) || ''
  );
  ctx.drawImage(avatar, banner.avatar.draw.x, banner.avatar.draw.y, 200, 200);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    'welcome-image.png'
  );

  channel
    .send(attachment)
    .catch(() =>
      console.error(
        `Failed to send welcome banner[${config.bannerType}] for guild[${member.guild.id}]`
      )
    );
};

const applyText = (canvas: Canvas.Canvas, text: string, banner: any) => {
  const ctx = canvas.getContext('2d');
  let fontSize = 55;
  do {
    ctx.font = `${(fontSize -= 2)}px Inter`;
  } while (ctx.measureText(text).width > canvas.width - banner.offset);

  return ctx.font;
};
