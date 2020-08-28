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
    const mutes = G_MUTES.map(m => `ID: ${m.user_id} --- Unmute date: ${moment.unix(m.unmute_date)}\n`).join('');
    console.log(mutes.length)
    for(const mute of split(mutes, 1990)) {
      message.channel.send(
        `Remove by using the appropriate User ID\n${mute === '' ? 'No current mutes.' : mute}`
      );
    }
	}
}

function split(input: string, len: number): string[] {
  return input.match(new RegExp('.{1,' + len + '}(?=(.{' + len + '})+(?!.))|.{1,' + len + '}$', 'g')) || [input];
}

export default listMutes;