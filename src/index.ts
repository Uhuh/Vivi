import BB from './bot';

const BowBot = new BB();

BowBot.start()
	.catch((e) => console.error(`Caught an error!\n${e}`));