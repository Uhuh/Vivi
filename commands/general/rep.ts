import { Message } from "discord.js";

const rep = {
	desc: 'Check Your, or Another Users Rep',
	name: 'rep',
	args: '[@user]',
	type: '',
	run: (message: Message, args: string[]) => {
		const userArg = message.mentions.members?.last() || message.author;
		let uRep = 0;

		if (!userArg) return;

		if (!reputation[userArg.id]) {
			reputation[userArg.id] = {
				repu: 0
			};
		}
		uRep = reputation[userArg.id].repu;

		message.channel.send(`${userArg} has ${uRep} repuation points!`);
		//.then(msg => {
		//    msg.delete({ timeout: 10000 } )
		//});
	}
}

export default rep