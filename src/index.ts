import BB from './bot';

const ViviBot = new BB();

ViviBot.start()
	.catch((e) => console.error(`Caught an error!\n${e}`));