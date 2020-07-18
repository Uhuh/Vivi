import { Message } from "discord.js";
import { GET_REP, SET_REP } from "../../src/setup_tables";

const takerep = {
	desc: ' Takes a Users Rep',
	name: 'takerep',
	args: '<@user> <Rep>',
	type: 'admin',
	run: (message: Message, args: string[]) => {
		if (!message.guild || !message.member?.hasPermission(["MANAGE_GUILD"])) return;
		const userArg = message.mentions?.members?.last();
		if (args.length < 1 || Number.isNaN(Number(args[1])) || !userArg || message.author.id === userArg.id) return;
		let uRep = (Number(args[1]) > 0 ? Math.ceil(Number(args[1])) : 1);

		const userRep = GET_REP(userArg.id);

		userRep.reputation -= uRep;

		SET_REP(userRep);

		message.channel.send(`${message.author} has taken ${uRep} from ${userArg}.`);

		/*const repRoles = [
				{ id: "", repThresh: 0},
				{ id: "", repThresh: 0},
				{ id: "", repThresh: 0}
		];
  
		const member = message.guild?.members.cache.get(userArg.id);
		for(const role of repRoles) {
				if(reputation[userArg.id].repu < role.repThresh) {
						member?.roles.remove(role.id);
				}
		}*/
	}
}

export default takerep