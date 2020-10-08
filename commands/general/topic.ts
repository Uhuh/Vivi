import { Message } from "discord.js";

const topic = {
	desc: "Random Topic Generator",
	name: "topic",
	args: "",
	type: "general",
	run: (message: Message) => {
		const responses = [
			'How tall are you?',
			'What is your favorite fast food chain?',
			'What is your favorite Pokemon?',
			'What pottermore house are you in?',
			'What is your zodiac?',
			'🔫 Put your hands up! 🔫',
			'What is your favorite game?',
			'What is your opinion on math?',
			'What is your favorite painting?',
			'What is your favorite food?',
			'What is something you think is really underappreciated?',
			'Who is your favorite youtuber?',
			'Start talking about bugs!',
			'What is something everyone else loves that you think is totally overrated?',
			'If you could travel through time, would you explore the past or see the future?',
			'If you could have one superpower, which would that be?',
			'What kind of music do you listen to?',
			'If you were suddenly invisible for the day, how would you spend it?',
			'If you could have any superpower what would it be?',
			'If you could become any fictional character who would you become?',
			'Who do you look up to and why?',
			'What is your favorite book?',
			'Do you like to cook or bake? How did you learn?',
			'What was your favorite thing to do as a kid?',
			'<a:vibeamongus:760260587316969522> Vibe time <a:vibeamongus:760260587316969522>'
		]
		const randIndex = Math.floor(Math.random() * responses.length);

		message.delete();
		message.channel.send(responses[randIndex]);
	}
}

export default topic;