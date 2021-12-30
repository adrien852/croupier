const tmi = require('tmi.js')
require('dotenv').config()

const options = {
    options: { debug: true },
	identity: {
		username: process.env.BOT_USERNAME,
		password: process.env.OAUTH_TOKEN
	},
	channels: [ process.env.CHANNEL_NAME ]
}
const client = new tmi.Client(options)

client.connect();

var isCroupierActive = false
var croupierDurationTime = 20000; //2 seconds
var croupierParticipants = new Array();
const CroupierStartCommand = '!croupierstart'
const CroupierJoinCommand = '!croupier'

client.on('message', (channel, tags, message, self) => {
	// Ignore echoed messages.
	if(self) return;

    //Launch roll event
    if(!isCroupierActive && message.toLowerCase() === CroupierStartCommand) {
        isCroupierActive = true
        client.say(channel, `Le Croupier ouvre boutique. Lancez vos dés avec la commande `+CroupierJoinCommand)
        //Close roll event after croupierDurationTime
        setTimeout(function(){
            //Choose winner
            var winnerPosition = Math.floor(Math.random() * (croupierParticipants.length));
            client.say(channel, `@${croupierParticipants[winnerPosition].name} Ton dé est choisi : ${croupierParticipants[winnerPosition].roll}`)
            isCroupierActive = false
        }, croupierDurationTime)
    }

    //Detect join commands
    if(isCroupierActive && message.toLowerCase() === CroupierJoinCommand) {
        //Join if not already joined
        var alreadyRolled = false;
        croupierParticipants.forEach(function(participant){
            if(participant.name.toLowerCase() === tags.username.toLowerCase()) {
                alreadyRolled = true;
            }
        })
        if(!alreadyRolled) {
            //Generate a RNG from 1 to 20
            var min = Math.ceil(1)
            var max = Math.floor(20)
            var diceResult = Math.floor(Math.random() * (max - min +1)) + min
            
            //Save the RNG in list
            croupierParticipants.push({name: tags.username, roll: diceResult})
            
            //Show the result in chat
            client.say(channel, `@${tags.username} Ton dé est lancé : ${diceResult}`)
        }
    }
});