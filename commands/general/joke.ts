import { Message } from "discord.js";

const viviJokes = [
	"What do you call a pig that does karate? ||A pork chop.||",
	"Why did the bike fall over? ||It was two tired.||",
	"Why did the golfer bring two pairs of pants? ||In case he got a hole in one.||",
	"Why did the Clydesdale give the pony a glass of water? ||Because he was a little horse.||",
	"What did the policeman say to his belly button? ||You’re under a vest.||",
	"Why did the man get hit by a bike every day? ||He was stuck in a vicious cycle.||",
	"What did the bartender say to the turkey sandwich when it tried to order a beer? ||“Sorry, we don’t serve food here.”||",
	"Why do seagulls fly over the sea? ||If they flew over the bay, they would be bagels.||",
	"What’s the difference between the bird flu and the swine flu? ||One requires tweetment and the other an oinkment.||",
	"Why do people say “break a leg” when you go on stage? ||Because every play has a cast.||",
	"What do you call an alligator detective? ||An investi-gator.||",
	"What kind of ghost has the best hearing? ||The eeriest.||",
	"How did the dead brother and his dead brother resemble each other? ||They were dead ringers.||",
	"Why are there gates around cemeteries? ||Because people are dying to get in.||",
	"Why shouldn’t you write with a broken pen? ||Because it’s pointless.||",
	"Why did the scarecrow win an award? ||Because he was outstanding in his field.||",
	"Where can you buy soup in bulk? ||The stock market.||",
	"If athletes get athlete’s foot, what do elves get? ||Mistle-toes.||",
	"What’s brown and sticky? ||A stick.||",
	"What did the yoga instructor say when her landlord tried to evict her? ||Namaste.||",
	"How does a school of fish keep up on happenings in the ocean? ||They listen to the current news.||",
	"Why aren’t DJ's allowed to work at fish markets? ||because they’re always dropping the bass.||"
];

const joke = {
	desc: "Send a random joke.",
	name: "joke",
	args: "",
	type: "general",
	run: (message: Message) => {
		message.delete();
		const jokes = viviJokes[Math.floor(Math.random() * viviJokes.length)];
		return message.reply(`${jokes}`)
	}
}

export default joke;