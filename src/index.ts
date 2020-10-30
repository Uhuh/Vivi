import VV from './bot';

const ViviBot = new VV({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES'],
});

ViviBot.start().catch((e) => console.error(`Caught an error!\n${e}`));
