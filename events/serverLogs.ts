import * as Discord from 'discord.js';
import BowBot from "../src/bot";
import { SERVER_LOGS, GUILD } from '../src/vars';

// Discord Message
type DMsg =  Discord.Message | Discord.PartialMessage;

export const MessageDelete = (client: BowBot, message: DMsg) => {
  const embed = new Discord.MessageEmbed();
  const channel = client.guilds.cache.get(GUILD)?.channels.cache.get(SERVER_LOGS) as Discord.TextChannel;
  embed
    .setTitle('**Message Deleted**')
    .setAuthor(message.author?.username, message.author?.avatarURL() || '')
    .setDescription(message.content)
    .addField('**---**',
      `**Message author:** <@${message.author?.id}>\n**Channel:** <#${message.channel?.id}>)`
    )
    .setFooter(`ID: ${message.id}`)
    .setTimestamp(new Date());

    channel.send(embed);
}

export const MessageEdit = (client: BowBot, oldMsg: DMsg, newMsg: DMsg) => {
  const embed = new Discord.MessageEmbed();
  const channel = client.guilds.cache.get(GUILD)?.channels.cache.get(SERVER_LOGS) as Discord.TextChannel;
  embed
    .setTitle('**Message Edited**')
    .setAuthor(newMsg.author?.username, newMsg.author?.avatarURL() || '')
    .setDescription(oldMsg.content)
    .addField('**After edit**', newMsg.content)
    .addField('**---**',
      `**Message author:** <@${newMsg.author?.id}>\n**Channel:** <#${newMsg.channel?.id}>\n[Jump to message](${newMsg.url})`
    )
    .setFooter(`ID: ${newMsg.id}`)
    .setTimestamp(new Date());
  
  channel.send(embed);
}