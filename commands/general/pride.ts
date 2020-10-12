import { Message } from "discord.js";

const hotlines = [
  "LGBTQ friendly related hotlines, don't be afraid to ask for help if you need it. <:viviheart:756940484101799967>",
  "You are loved and valued, reach out if you ever need someone to talk to. <:viviheart:756940484101799967>",
  "Someone is always there for you, even if you feel alone. <:viviheart:756940484101799967>"
];

const donations = [
  "Every donation counts, try and help out if you can! <:vivishy:757245413689655386>",
  "Show your support right here and support the LGBTQ community! <:viviamaze:757245413219631195>",
  "Try and help if you can with these donation links! <:vivilove:757985670710034543>"
];

const resourcepages = [
  "Vivi says LGBTQ+ Rights! Looking for more information? Check out these websites! <:vivilove:757985670710034543>",
  "Here are some helpful LGBTQ+ resources! Click the link right here for more information! <:viviwink:758002855021117446>",
  "Make sure to check out these great and helpful LGBTQ+ resources! <:vivilove:757985670710034543>"
];

const hotline = hotlines[Math.floor(Math.random() * hotlines.length)];
const donation = donations[Math.floor(Math.random() * donations.length)];
const resource = resourcepages[Math.floor(Math.random() * resourcepages.length)];

const viviPride = [
  `${hotline} https://lgbtqia.ucdavis.edu/support/hotlines`,
  `${hotline} https://translifeline.org/hotline`,
  `${hotline} https://fenwayhealth.org/care/wellness-resources/help-lines/`,
  `${hotline} https://www.glbthotline.org/talkline.html`,
  `${hotline} https://www.glbthotline.org/national-hotline.html`,

  `${donation} https://lgbt.foundation/donate`,
  `${donation} https://lgbtfunders.org/give-2/`,
  `${donation} https://pflag.org/supportpflag`,
  `${donation} https://www.pridestl.org/donate`,
  `${donation} https://www.colorbloq.org/donate`,

  `${resource} https://www.thetrevorproject.org/get-help-now/`,
  `${resource} https://www.thetrevorproject.org/resources/trevor-support-center/`,
  `${resource} https://www.glaad.org/resourcelist`,
  `${resource} https://www.glsen.org/`,
  `${resource} https://pflag.org/`
];

const pride = {
  desc: "Pride resources!",
  name: "pride",
  args: "",
  type: "general",
  run: (message: Message) => {
    message.delete();
    const resources = viviPride[Math.floor(Math.random() * viviPride.length)];
    return message.reply(`${resources}`)
  }
}
        
export default pride