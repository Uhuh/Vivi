import ViviBot from './bot';

const Vivi = new ViviBot();

Vivi.start().catch((e) => console.error(`Caught an error!\n${e}`));
