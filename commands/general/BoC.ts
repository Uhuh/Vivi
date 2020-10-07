import { Message } from "discord.js";

const modsadscrabs = [
    //ads
    "ari#3103",
    "Panku#0721",
    "OrchidAlloy#0001",
    "jeaoq#3519",
    
    //mods
    "Abe#1989",
    "AmariS#1870",
    "Ayukei#6669",
    "Elder Catherine#0707",
    "Pleased Chomusuke#3800",
    "EnemyUnicorn903#5098",
    "Etzaen#8803",
    "grey ♡#1115",
    "PekiCodex#4434",
    "Smoke#1728",
    "Icecold#2267",

    //crabs
    "VeiledProduct80#9197",
    "CouchRadish#1074",
    "SilverForrest#9274",
    "ミルルン#1764",
    "Dollkuro#1069",
    "Jenkret#6343",
    "CephaMoon#1121",
    "Jenkret#6343",
    "Chronomly#8108",
    "CouchRadish#1074",
    "dess ♡#2028",
    "EllieAoi#7176",
    "elloace_#7633",
    "Gin_Moriko#9274",
    "Mask#8928",
    "Loli Detective Left Shark#1974",
    "Axolotl Cliff#6770",
    "Ricardough#5758",
    "Jade.#2751",
    "StealthBoy#5926",
    "Sun ♡#5502",
    "VeiledProduct80#9197",
    "Min#1118",
    "Yuun#6345",
    
    //special
    "Laurissss#9488",
    "Tatsu#8792",
    "Vivi#0781",
    "yukoraii#5850",
    "Nebbi#6969",
    "DeadDoll#5742",
    "Rin#9730"
];

const BoC = {
	desc: "Has vivi provide someone for you to call based or cringe",
	name: "boc",
	args: "",
	type: "general",
	run: (message: Message) => {
        message.delete();
        const MAC = modsadscrabs[Math.floor(Math.random() * modsadscrabs.length)];
        message.reply(`Is ${MAC} based or cringe?`)
    }
}

export default BoC;