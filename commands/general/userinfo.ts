import { Message, MessageEmbed } from "discord.js";
import BowBot from "../../src/bot";

export default {
  desc: 'Information about user.',
  name: 'userinfo',
  args: '',
  type: 'general',
  run: async function (message: Message, _args: string[], client: BowBot) {
    const { user } = client;

    if (!user || !message.mentions || !message.mentions.members) return;

    // There is some issues with discord and cached users so if someone hasn't sent a message this command won't
    // work for said user. Assuming the person mentions a new user.
    const member = message.mentions.members.find(val => val.id !== user.id) || message.member;

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