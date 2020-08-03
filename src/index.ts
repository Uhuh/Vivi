import BB from './bot';

const SetsuBot = new BB();

SetsuBot.start()
	.catch((e) => console.error(`Caught an error!\n${e}`));