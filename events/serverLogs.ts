import * as Discord from 'discord.js';
import BowBot from "../src/bot";
import { SERVER_LOGS, GUILD } from '../src/vars';
import * as ta from 'time-ago';

// Discord Message
type DMsg =  Discord.Message | Discord.PartialMessage;

export const UserJoin = (client: BowBot, member: Discord.GuildMember | Discord.PartialGuildMember) => {
  const embed = new Discord.MessageEmbed();
  const channel = client.guilds.cache.get(GUILD)?.channels.cache.get(SERVER_LOGS) as Discord.TextChannel;
  const howLong = ta.ago(member.user?.createdTimestamp);

  let warnings = '';
  if (howLong.includes('second') || howLong.includes('days')) {
    warnings += `- Account is new\n`;
  } if (!member.user?.avatarURL()) {
    warnings += `- Account has no avatar`;
  }

  embed
    .setTitle('**User Joined**')
    .setAuthor(member.user?.tag, member.user?.avatarURL() || '')
    .setDescription(`<@${member.id}> joined the server`)
    .addField(`**Account created**`, howLong)
    .setFooter(`ID: ${member.id}`);

  if (warnings !== '') {
    embed
      .addField(`**WARNING**`, 
        `\`\`\`asciidocs\n${warnings}\`\`\``
      )
  }

  channel.send(embed);
}

export const MessageDelete = (client: BowBot, message: DMsg) => {
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
    .setDescription(message.content)
    .addField('**---**',
      `**Message author:** <@${message.author?.id}>\n**Channel:** <#${message.channel?.id}>`
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
    .setAuthor(newMsg.author?.tag, newMsg.author?.avatarURL() || '')
    .setDescription(oldMsg.content)
    .addField('**After edit**', newMsg.content)
    .addField('**---**',
      `**Message author:** <@${newMsg.author?.id}>\n**Channel:** <#${newMsg.channel?.id}>\n[Jump to message](${newMsg.url})`
    )
    .setFooter(`ID: ${newMsg.id}`)
    .setTimestamp(new Date());
  
  channel.send(embed);
}