import * as Discord from 'discord.js';
import SetsuBot from "../src/bot";
import { SERVER_LOGS, GUILD } from '../src/vars';
import { GET_USER_MUTE } from '../src/setup_tables';

// Discord Message
type DMsg =  Discord.Message | Discord.PartialMessage;

export const UserJoin = (member: Discord.GuildMember | Discord.PartialGuildMember) => {
  const muteId = '733341358693285979';
  const user = GET_USER_MUTE(member.id);
  if (user) {
    member.roles?.add(muteId)
      .catch(() => console.error(`Couldn't mute the user on join.`));
  } else if(member instanceof Discord.GuildMember) {
    /* member.send(
      `Welcome to the Love Letter community!\nPlease wait 10 minutes until I can help you get verified. In the meantime make sure to read the <#732961554005229639> and look at the <#729135006018175077>.`
    ).catch(() => console.error(`Couldn't DM user welcome message.`)); */
  }
}

export const MessageDelete = (client: SetsuBot, message: DMsg) => {
  const embed = new Discord.MessageEmbed();
  const channel = client.guilds.cache.get(GUILD)?.channels.cache.get(SERVER_LOGS) as Discord.TextChannel;
  if (message.attachments?.size) {
    for(const [, att] of message.attachments) {
      channel.send(att.proxyURL);
    }
  }
  embed
    .setTitle('**Message Deleted**')
    .setAuthor(message.author?.tag, message.author?.avatarURL() || '')
    .setDescription(message.content === '' ? 'Setsu: Empty' : message.content)
    .addField('**---**',
      `**Message author:** <@${message.author?.id}>\n**Channel:** <#${message.channel?.id}>`
    )
    .setFooter(`ID: ${message.id}`)
    .setTimestamp(new Date());

    channel.send(embed);
}

export const MessageEdit = (client: SetsuBot, oldMsg: DMsg, newMsg: DMsg) => {
  const embed = new Discord.MessageEmbed();
  const channel = client.guilds.cache.get(GUILD)?.channels.cache.get(SERVER_LOGS) as Discord.TextChannel;
  embed
    .setTitle('**Message Edited**')
    .setAuthor(newMsg.author?.tag, newMsg.author?.avatarURL() || '')
    .setDescription((oldMsg?.content === '' ? 'Setsu: Empty!' : oldMsg.content) || 'Setsu: Empty!')
    .setFooter(`ID: ${newMsg.id}`)
    .setTimestamp(new Date());

  const content = newMsg.content || 'Setsu: Empty!';

  for(const line of split(content, 1024)) {
    embed.addField(`**After edit**`, line);
  }

  embed.addField('**---**',
    `**Message author:** <@${newMsg.author?.id}>\n**Channel:** <#${newMsg.channel?.id}>\n[Jump to message](${newMsg.url})`
  );
  
  channel.send(embed);
}

function split(input: string, len: number): string[] {
  return input.match(new RegExp('.{1,' + len + '}(?=(.{' + len + '})+(?!.))|.{1,' + len + '}$', 'g')) || [input]
}