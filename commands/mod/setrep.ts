import { Message } from "discord.js";
import { GET_REP, SET_REP } from "../../src/setup_tables";

const setrep = {
	desc: '(ADMIN) Sets a Users Rep',
	name: 'setrep',
	args: '<@user> <Rep>',
	type: 'admin',
	run: (message: Message, args: string[]) => {
		if (!message.guild || !message.member?.hasPermission(["MANAGE_GUILD"])) return;
		const userArg = message.mentions?.members?.last();
		if (args.length < 1 || Number.isNaN(Number(args[1])) || !userArg || message.author.id === userArg.id) return;
		let uRep = Number(args[1]) || 0;

		const userRep = GET_REP(userArg.id);

		userRep.reputation += uRep;

		SET_REP(userRep);

		message.channel.send(`${message.author} has set ${userArg}'s rep to ${uRep}!`);

		/*const repRoles = [
				{ id: "", repThresh: 0},
				{ id: "", repThresh: 0}
		];
  
		const member = message.guild?.members.cache.get(userArg.id);
		for(const role of repRoles) {
				if(reputation[userArg.id].repu >= role.repThresh) {
						member?.roles.add(role.id);
				}
		}
	  
		for(const role of repRoles) {
				if(reputation[userArg.id].repu < role.repThresh) {
						member?.roles.remove(role.id);
				}
		}*/
	}
}

export default setrep