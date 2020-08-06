import { Message } from "discord.js";

const hug = {
	desc: "Hug a user.",
	name: "hug",
	args: "<user mention>",
	type: "general",
	run: (message: Message) => {
    const user = message.mentions.members?.first();
    
    if (!user) {
      return message.reply(`what are you trying to do...? <:SetsuConfused:739980857615319151>`);
    } else if (user === message.member) {
      return message.reply(`you can't hug yourself. <:SetsuCry:740056013369245756>`);
    }

    return message.reply(`you hugged <@${user.id}>, how dare you hug someone that isn't senpai? <:SetsuPuke:739980857699467264>`);
	}
}

export default hug;