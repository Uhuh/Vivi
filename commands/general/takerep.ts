import { Message } from "discord.js";

const takerep = {
	desc: '(ADMIN) Takes a Users Rep',
	name: 'takerep',
	args: '<@user> <Rep>',
	type: 'admin',
	run: (message: Message, args: string[]) => {
		if (!message.guild || !message.member?.hasPermission(["MANAGE_GUILD"])) return;
		const userArg = message.mentions?.members?.last();
		if (args.length < 1 || Number.isNaN(Number(args[1])) || !userArg || message.author.id === userArg.id) return;
		let uRep = (args[1] > 0 ? Math.ceil(args[1]) : 1);

		if (!reputation[userArg.id]) {
			reputation[userArg.id] = {
				repu: Math.max(uRep, -4294967296)
			};
		} else {
			reputation[userArg.id] = {
				repu: Math.max(reputation[userArg.id].repu - uRep, -4294967296)
			};
		}

		fs.writeFile("./reputation.json", JSON.stringify(reputation), (err) => {
			if (err) console.log(err);
		});

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