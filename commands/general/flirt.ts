import { Message } from 'discord.js';

const viviFlirts = [
  'Well, here I am. What are your other two wishes?',
  "Hey, my name's Microsoft. Can I crash at your place tonight?",
  'Are you French? Because Eiffel for you.',
  'Do you like raisins? How do you feel about a date?',
  "There is something wrong with my cell phone. It doesn't have your number in it.",
  'If I could rearrange the alphabet, I’d put ‘U’ and ‘I’ together.',
  'Aside from being sexy, what do you do for a living?',
  "I must be a snowflake, because I've fallen for you.",
  "Are you from Tennessee? Because you're the only 10 I see!",
  'If you were a Transformer… you’d be Optimus Fine.',
  'Are you a parking ticket? Because you’ve got FINE written all over you.',
  'I wish I were cross-eyed so I can see you twice.',
  'I must be in a museum, because you truly are a work of art.',
  'Do you believe in love at first sight—or should I walk by again?',
  "I'm no photographer, but I can picture us together.",
  'Feel my shirt. Know what it’s made of? Boyfriend material.',
  'Are you related to Jean-Claude Van Damme? Because Jean-Claude Van Damme you’re sexy!',
  'If you were a chicken, you’d be impeccable.',
  'Did your license get suspended for driving all these guys crazy?',
  'I’m learning about important dates in history. Wanna be one of them?',
  'Baby, if you were words on a page, you’d be fine print.',
  'Did you just come out of the oven? Because you’re hot.',
  'It’s a good thing I have my library card because I am totally checking you out.',
  'I was blinded by your beauty; I’m going to need your name and phone number for insurance purposes.',
  'I was wondering if you had an extra heart. Because mine was just stolen.',
  'Is your name Google? Because you have everything I’ve been searching for.',
];

const flirt = {
  desc: 'Have vivi flirt with you~',
  name: 'flirt',
  args: '',
  type: 'general',
  run: (message: Message) => {
    message.delete();
    const flirts = viviFlirts[Math.floor(Math.random() * viviFlirts.length)];
    message.reply(`${flirts}`);
  },
};

export default flirt;
