import ViviBot from './bot';

const Vivi = new ViviBot({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES'],
});

Vivi.start().catch((e) => console.error(`Caught an error!\n${e}`));
