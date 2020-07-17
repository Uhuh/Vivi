import { Message } from "discord.js";

const rule = {
	desc: '(ADMIN) Displays Given Rule',
	name: 'rule',
	args: '<Rule Number>',
	type: 'admin',
	run: (message: Message, args: string[]) => {
		if (!message.guild || !message.member?.hasPermission(["MANAGE_GUILD"])) return;
		if (args.length && Number.isNaN(Number(args[0]))) {
			const rules = [
				`1). No NSFW in this server. Any NSFW posted here will result in a ban.`,
				`2). Venting and Ranting belong in their appropriate channels, please don't do it in the main <#729515427109011467>  chat.`,
				`3). No harassment of any kind ( It makes people uncomfortable + I don't want this server to be blacklisted.)`,
				`4). If someone is bothering you, please report it to me immediantly!`,
				`5). If you really want to ask me something (about the channel, videos, or even projects I work on), please do it in <#729646370234957874>  because it'll most-likely get answered if it's in there.`,
				`6). Please enjoy your time here, and if you don't, I respect your choice in leaving if you do so.`,
				`7). The NSFW rule will be cracked down on more, if you see ANY form of NSFW, contact a mod IMMEDIATELY`,
				`8). Please don't use slurs/be racist/blast music in the voice chat, etc, just enjoy your time here and be nice to everyone. Using a horrible slur, like a very bad one, will result in a ban. Using a light slur, will end up in a strike. (Light and Horrible slurs should be typical common sense)`,
				`9). No raiding, if we catch you raiding, you'll be banned (Raiding reflects back on the discord server, and we don't want that on us!)`,
				`10). Considering... recent developments, we're repealing this rule. The truth should be set free.`,
				`11) slurs and certain swear words result in a 3 strikes and your out system so keep language safe.`,
				`12) No politics of any kind, mods have had to much stress dealing with it and will result in warning and bans. This includes gender politics, we have nothing against race or gender we just dont want toxic debates but you are allowed to correct people if they misgender you.`,
				`13) Do not threaten, or commit doxxing, ddosing, etc.`,
				`14) Offensive, NSFW and Political memes/shitposts are banned.`,
				`15) If something is deemed too disturbing, it will be removed. This includes but is not limited to gore/body horror, pedophilia and rape. Any images of said things will be immediately removed. If you wish to discuss these things, please use spoiler tags for any explicit details.`,
				`16) No self promotion of Discord server links. This includes DMs If we catch it your gone.`
			];

			message.delete();
			message.channel.send(rules[Number(args[0]) - 1]);
		}
	}
}

export default rule;