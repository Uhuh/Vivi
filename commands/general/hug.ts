import { Message } from "discord.js";

const hugEmotes = [ 
  "<a:SetsuSparkleRou:741026907960901697>","<a:SetsuSparkle:741026998117335181>", "<:BowkunLove:735140120067571802>",
  "<:SetsuEpic:739605281943584859>", "<:SetsuAww:739638857263349882>", "<:SetsUwU:740031361427177482>",
  "<:SetsuWow:739980858382876712>", "<a:SetsuBounceRou:740807323261337640>", "<a:SetsuBounce:740807275748262018>",
  "<:SetsuComfy:740299379641942128>", "<:SetsuComfyRou:740233879507435701>", "<:SetsuFlushed:740354191423307919>",
  "<:SetsuEyes:740260660134543381>", "<:SetsuGaze:739980857468649605>" 
];

const hug = {
	desc: "Hug a user.",
	name: "hug",
	args: "<user mention>",
	type: "general",
	run: (message: Message) => {
    const user = message.mentions.members?.first();
    
    if (!user) {
      return message.reply(`I only accept hugs from senpai <:SetsuAww:739638857263349882>`);
    } else if (user === message.member) {
      return message.reply(`the only person I'll hug is senpai <:SetsuAww:739638857263349882>`);
    }
    const emote = hugEmotes[Math.floor(Math.random() * hugEmotes.length)];
    return message.reply(`you hugged <@${user.id}> ${emote}`);
	}
}

export default hug;