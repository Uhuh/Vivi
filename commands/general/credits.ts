import { MessageEmbed, Message } from "discord.js";
import BowBot from "../../src/bot";

const credits = {
    desc: "Bot Development Credits",
    name: "credits",
    args: "",
    type: "",
    run: (message: Message, args: string[], client: BowBot) => {
        const embed = new MessageEmbed();

        const { user } = client;

        if (!user) return;

        embed
            .setTitle('**CREDITS**')
            .setColor(16711684)
            .setAuthor(user.username, user.avatarURL() || "")
            .setThumbnail(user.avatarURL() || "")
            .setFooter(`Replying to: ${message.author.tag}`)
            .setTimestamp(new Date());
        
        
        embed.addField(`**Lead Developer**`, `Cepha`);
        embed.addField(`**Lead Code-Helper**`, `Panku`);
        embed.addField(`**Bow-Chan Character and Design**`, `SHORTCAKE`);
        embed.addField(`**Special Thanks**`,
        `DrApeis
        Ari
        Project Lovesick Staff
        The Incredible Project Lovesick Community
        You, The User`);

        message.channel.send({ embed });
    }
}

export default credits