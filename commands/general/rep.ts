import { Message } from "discord.js";
import { GET_REP } from "../../src/setup_tables";

const rep = {
	desc: 'Check Your, or Another Users Rep',
	name: 'rep',
	args: '[@user]',
	type: 'general',
	run: (message: Message, _args: string[]) => {
		const userArg = message.mentions.members?.last() || message.author;

		if (!userArg) return;

		const userRep = GET_REP(userArg.id);

		message.channel.send(`${userArg} has ${userRep?.reputation || 0} repuation points!`);
		//.then(msg => {
		//    msg.delete({ timeout: 10000 } )
		//});
	}
}

export default rep