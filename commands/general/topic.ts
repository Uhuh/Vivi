import { Message } from "discord.js";

const topic = {
	desc: "Random Topic Generator",
	name: "topic",
	args: "",
	type: "general",
	run: (message: Message) => {
		const responses = [
			'How tall are you?',
			'What is your favorite game?',
			'What is your opinion on math?',
			'What is your favorite painting?',
			'What is your favorite food?',
			'What is something you think is really underappreciated?',
			'Who is your favorite youtuber?',
			'Start talking about bugs!'
		]
		const randIndex = Math.floor(Math.random() * responses.length);

		message.delete();
		message.channel.send(responses[randIndex]);
	}
}

export default topic;