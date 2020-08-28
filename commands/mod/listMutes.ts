import { Message } from "discord.js";
import { GET_MUTES } from "../../src/setup_tables";
import * as moment from 'moment';

const listMutes = {
	desc: 'List of currently mtued users.',
	name: 'listmutes',
	args: '',
	type: 'admin',
	run: (message: Message, _args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(["MANAGE_CHANNELS"])) return;
    const G_MUTES = GET_MUTES();
    const mutes = G_MUTES.map(m => `\`ID: ${m.user_id} --- Unmute date: ${moment.unix(m.unmute_date)}\`\n`).join('');

		message.channel.send(
			`Remove by using the appropriate User ID\n${mutes === '' ? 'No current mutes.' : mutes}`
		);
	}
}

export default listMutes;