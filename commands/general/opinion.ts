import { Message } from "discord.js";

const viviOpinions = [
  //Positive words
  "cool!",
  "an amazing person!",
  "attractive",
  "awesome",
  "cute",
  "charming",
  "remarkable",
  "Amazing",
  "Awesome",
  "Blithesome",
  "Excellent",
  "Fabulous",
  "Fantastic",
  "Favorable",
  "Gorgeous",
  "Incredible",
  "Ineffable",
  "Mirthful",
  "Outstanding",
  "Perfect",
  "Propitious",
  "Remarkable",
  "Rousing",
  "Spectacular",
  "Splendid",
  "Stellar",
  "Stupendous",
  "Super",
  "Upbeat",
  "Unbelievable",
  "Wondrous",
  //Negative words 
  "annoying",
  "dishonest",
  "weird",
  "immature",
  "scary",
  "Aggressive",
  "Arrogant",
  "Boastful",
  "Bossy",
  "Boring",
  "Careless",
  "Clingy",
  "Cruel",
  "Cowardly",
  "Deceitful",
  "Dishonest",
  "Fussy",
  "Greedy",
  "Grumpy",
  "Harsh",
  "Impatient",
  "Impulsive",
  "Jealous",
  "Moody",
  "Narrow-minded",
  "Overcritical",
  "Rude",
  "Selfish",
  "Untrustworthy",
];

const opinion = {
  desc: "Give an opinion on a user.",
  name: "opinion",
  args: "<user mention>",
  type: "general",
  run: (message: Message) => {
    const user = message.mentions.members?.first();
    message.delete();

    if (!user) {
      return message.reply(`Who am I giving an opinion on?`);
    } 
    const opinions = viviOpinions[Math.floor(Math.random() * viviOpinions.length)];
      if (user === message.member) {
        return message.reply(`<@${user.id}> my opinion on you is that you are ${opinions}`);
      }
    return message.reply(`My opinion on <@${user.id}> is that they are ${opinions}`);
  }
}

export default opinion;