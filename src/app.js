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
var croupierDurationTime = 23000 //20 seconds
var croupierParticipants = new Array()
const CroupierStartCommand = '!croupier'
const CroupierJoinCommand = '!roll'

client.on('message', (channel, tags, message, self) => {
	// Ignore echoed messages.
	if(self) return;

    //Launch roll event
    if(tags.mod || tags.username.toLowerCase() == process.env.CHANNEL_NAME.toLowerCase()){
        if(!isCroupierActive && message.toLowerCase() === CroupierStartCommand) {
            croupierParticipants = new Array()
            isCroupierActive = true
            client.say(channel, `Osez affronter votre destinée ! Lancez vos dés avec la commande `+CroupierJoinCommand)
            //Close roll event after croupierDurationTime
            setTimeout(function(){
                //Choose winner if participants
                if(croupierParticipants.length > 0) {
                    var winnerPosition = Math.floor(Math.random() * (croupierParticipants.length))
                    client.say(channel, `"Alea jacta est" ! La fatalité a choisi @${croupierParticipants[winnerPosition].name}. Le résultat est : ${croupierParticipants[winnerPosition].roll}`)
                }
                else {
                    var min = Math.ceil(1)
                    var max = Math.floor(100)
                    var diceResult = Math.floor(Math.random() * (max - min +1)) + min
                    client.say(channel, `Votre destin vous échappe. Un dé est lancé : ${diceResult}`)
                }
                isCroupierActive = false
            }, croupierDurationTime)
        }
    }

    //Detect join commands
    if(isCroupierActive && message.toLowerCase() === CroupierJoinCommand) {
        //Join if not already joined
        var alreadyRolled = false
        croupierParticipants.forEach(function(participant){
            if(participant.name.toLowerCase() === tags.username.toLowerCase()) {
                alreadyRolled = true
            }
        })
        if(!alreadyRolled) {
            //Generate a RNG from 1 to 100
            var min = Math.ceil(1)
            var max = Math.floor(100)
            var diceResult = Math.floor(Math.random() * (max - min +1)) + min
            
            //Save the RNG in list
            croupierParticipants.push({name: tags.username, roll: diceResult})
            
            //Show the result in chat
            client.say(channel, `@${tags.username} Ton dé est lancé : ${diceResult}`)
        }
    }
});