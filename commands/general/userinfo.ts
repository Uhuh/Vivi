import { Message, MessageEmbed } from "discord.js";
import SetsuBot from "../../src/bot";

export default {
  desc: 'Information about user.',
  name: 'userinfo',
  args: '',
  type: 'general',
  run: async function (message: Message, args: string[], client: SetsuBot) {
    const { user } = client;

    if (!user || !message.mentions || !message.mentions.members) return;

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift() || message.author.id;

    if(message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    const member = message.guild?.members.cache.get(userId || '');

    if (!member) return;

    const embed = new MessageEmbed();

    embed.setTitle(`**User Info**`)
      .setColor(7419530)
      .setThumbnail(member.user.avatarURL({dynamic: true}) || "")
      .setFooter(`Replying to: ${message.author.tag}`)
      .addField(`**DETAILS**`, 
        `\`\`\`asciidoc
• Username :: ${member.user.tag}
• ID       :: ${member.user.id}
• Created  :: ${member.user.createdAt.toDateString()}
• Joined   :: ${member.joinedAt?.toDateString()}\`\`\``
      )
      .addField(`**STATUS**`, 
        `\`\`\`asciidoc
• Type     :: ${member.user.bot ?  "Beepboop, I'm a bot." : "I'm Human."}
• Presence :: ${member.presence.activities[0]}\`\`\``
      )
      .setTimestamp(new Date());

    message.channel.send({ embed })
  }
}
