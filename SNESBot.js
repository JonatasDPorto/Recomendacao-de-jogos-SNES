const Telegraf = require('telegraf')

const Markup = require('telegraf/markup')
var rp = require('request-promise');

var Recommendation = require('./Recommendation.js')


const bot = new Telegraf("1214755428:AAHShdr8uKuY_fp3jR3JMrXXqVsMn_BB5WI")

//PESQUISA A LISA DE JOGOS E COLOCA NA INLINE COM O @ LA SLA COMO CHAMA
bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
  var result = await Recommendation.inlineQuery(inlineQuery.query);
  return answerInlineQuery(result)
})


//SEMPRE QUE EDITAR UMA MENSAGEM
bot.on('edited_message', (ctx) => {
	if(ctx.update.edited_message == undefined)return;
	//PEGA A MENSAGEM EDITADA)
	var message = ctx.update.edited_message;
	//SE FOR COMMANDO RATE
	if(message.text.includes("/rate")){
		
		rate(ctx, message, false);
	}
	//
})

async function rate(ctx, message, is_bot){
	//SEPARA EM [0]RATE, [1]ID DO JOGO, [2]ESTRELAS
	var splited = message.text.split('!');
	//BUSCA NO DB O JOGO COM O ID
	await Recommendation.newQuery({id: Number(splited[1])}).then((data) =>{
		if(data.length == 0)return;
		//SE ACHAR O JOGO
		//SETA A AVALIACAO NO DB		
		Recommendation.rate(message.from.id, data[0].id, splited[2].length)	
		//E MANDA MSG DIZENDO QUE AVALIOU
		ctx.telegram.sendMessage(ctx.chat.id, `${message.from.first_name} avaliou <a href=\"${data[0].imageURL}\">${data[0].name}</a> com ${splited[2]}`, {parse_mode:"HTML"})
	})
	//DELETA A MENSAGEM COM O COMANDO
	if(!is_bot)ctx.telegram.deleteMessage(ctx.chat.id, message.message_id);
}

//SEMPRE QUE UM BOTAO DE CALLBACK FOR CHAMADO
bot.on('callback_query', (ctx, next) =>{
	console.log(ctx.update.callback_query.data)
	//VERIFICA SE É O DE AVALIAR
	if(ctx.update.callback_query.data.includes("avaliar")){
		//SEPARA O DATA EM [0]STRING AVALIAR, [1]ID DO GAME
		var splited = ctx.update.callback_query.data.split("!")
		//PESQUISA O GAME PELO ID
		Recommendation.newQuery({id: Number(splited[1])}).then((data) =>{
			if(data.length == 0) return;
			//SE ACHAR O JOGO
			//EDITA A MENSAGEM ANTERIORMENTE CLICADA PARA TROCAR OS BOTOES POR ★★★★★
			ctx.editMessageCaption(`<a href=\"${data[0].imageURL}\">${data[0].name}</a>`, {
				parse_mode: "HTML",
				reply_markup: Markup.inlineKeyboard([
			  	[{
			  		text:'★',
			  		callback_data: `★!${data[0].id}`
			  	},
			    {
			  		text:'★★',
			  		callback_data: `★★!${data[0].id}`
			  	},
			    {
			  		text:'★★★',
			  		callback_data: `★★★!${data[0].id}`
			  	}],
			    [{
			  		text:'★★★★',
			  		callback_data: `★★★★!${data[0].id}`

			  	},
			    {
			  		text:'★★★★★',
			  		callback_data: `★★★★★!${data[0].id}`
			  	}]
			])})
		})

	//VERIFICA SE É BOTAO DE ★
	}else if (ctx.update.callback_query.data.includes("★")){

		//SEPARA O DATA EM [0]ESTRELAS, [1]ID DO GAME
		var splited = ctx.update.callback_query.data.split("!")
		//PESQUISA O GAME PELO ID
		Recommendation.newQuery({id: Number(splited[1])}).then((data) =>{
			if(data.length == 0) return;
			//SE ACHAR O JOGO
			//EDITA A MENSAGEM ANTERIORMENTE CLICADA PARA TROCAR PELO COMANDO /RATE !ID DO GAME !ESTRELAS

			if(ctx.update.callback_query.message != undefined){
				rate(ctx, {
					text:`/rate !${data[0].id} !${splited[0]}`,
					from:{
						id:ctx.update.callback_query.from.id,
						first_name: ctx.update.callback_query.from.first_name
					}
				}, true)

			}else{
				ctx.editMessageCaption(`/rate !${data[0].id} !${splited[0]}`);

			}

		})


	}
	//RESPONDE LOGO ISSO PRA N FICAR ESPERANDO LA O NEGOCINHO RODANDO
	ctx.answerCbQuery()//FK IMPORTANTE
	next()
})

bot.on('new_chat_members', (ctx) => {

	ctx.reply(`Seja bem vindo ${ctx.message.new_chat_members[0].first_name}.
Digite /comandos para ver os comandos disponiveis!`)
	Recommendation.createUser(ctx.from.id);

})

bot.command('start', (ctx) => {

	ctx.reply(`Seja bem vindo ${ctx.from.first_name}.
Digite /comandos para ver os comandos disponiveis!`)
	Recommendation.createUser(ctx.from.id);

})

bot.command('comandos', (ctx) => {
	ctx.reply(`
Hey ${ctx.from.first_name} se liga nisso:\n
♦ Digite @GamesSNESbot e pesquise pelos jogos que você gosta!!!
♦ /info para saber quem sou!!!
♦ /top10 e veja o top 10 jogos mais bem avaliados!!!
♦ /recomendados para ver os jogos recomendados para você!!!
♦ /conteme me diga um pouco de que voce ta achando sobre mim!

		`)

})

bot.command('info', (ctx) => {
	ctx.reply(`Eu sou um bot de recomendações de jogos de super nintendo, cool isn't it.`)

})

bot.command('top10', (ctx) =>{

	ctx.reply('Se liga nos 10 jogos mais F%$&# de todos os tempos!')

	Recommendation.getTop10().then(async(lista)=>{

		for(i in lista){
			await replyToAvaliate(ctx, lista[i])
			await sleep(200*i);
		}
	})
})

bot.command('conteme', (ctx)=>{
	var t = ctx.update.message.text;
	var text;
	if(t != undefined){
		text = t.substring(8, t.length)
	}
	if(text.trim().length == 0){
		return;
	}
	var options = {
	    method: 'POST',
	    uri: 'https://ussouthcentral.services.azureml.net/workspaces/d7682dd41a0c4eb195ec56f3e5ee6868/services/9202b89e5a6f41c392e0c186c64beef2/execute?api-version=2.0&format=swagger',
	    headers: {
		        'Content-type': 'application/json',
		        'Authorization':'Bearer 4gA+SPT8KHnidO5nb7OjoaMXRJPq1RApGGk9c6ISs+YswaPOiPi4rS39O4UGkzS5vweOUQZr2eFSqIfqErabYw=='
		    },
	    body: {
		  "Inputs": {
		    "input1": [
		      {
		        "tweet_text": text,
		        "sentiment": ""
		      }
		    ]
		  },
		  "GlobalParameters": {}
		},
	    json: true // Automatically stringifies the body to JSON
	};
	 
	rp(options)
	    .then(function (parsedBody) {
	        var result = parsedBody.Results.output1[0]['Scored Labels'];
	        if(result != undefined){
	        	replyRandom(ctx, result);
	        }
	    })
	    .catch(function (err) {
	        console.log(err)
	    });
	})

bot.command('/recomendados', async(ctx) => {

	Recommendation.recommendForMe(ctx.from.id).then(async(aceito)=>{

		await ctx.reply(`
		${ctx.from.first_name} esses são os jogos recomendados para você!!\n
		`)

		for(i in aceito){
			await replyToAvaliate(ctx, aceito[i])
			await sleep(200*i)

		}


	}, async(rejeitado) =>{


		await ctx.reply(`
		Sup ${ctx.from.first_name} você chegou agora!!
		Não se apresse, não é assim que a Força funciona!
		Que tal me dizer do que você gosta primeiro?\n
		`)
		await ctx.reply(`Avalie algum desses jogos!`)

		Recommendation.getTop10().then(async(lista)=>{

			for(i in lista){
				await replyToAvaliate(ctx, lista[i])
				await sleep(200*i);
			}
		})
	})
	
})
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function replyToAvaliate(ctx, game){
	ctx.reply(`<a href=\"${game.imageURL}\">${game.name}</a>`, {
		parse_mode: "HTML",
		reply_markup: Markup.inlineKeyboard([
	  	[{
	  		text:'★',
	  		callback_data: `★!${game.game_id}`
	  	},
	    {
	  		text:'★★',
	  		callback_data: `★★!${game.game_id}`
	  	},
	    {
	  		text:'★★★',
	  		callback_data: `★★★!${game.game_id}`
	  	}],
	    [{
	  		text:'★★★★',
	  		callback_data: `★★★★!${game.game_id}`

	  	},
	    {
	  		text:'★★★★★',
	  		callback_data: `★★★★★!${game.game_id}`
	  	}]
	])})
}

var positivo = ["🤣🤣🤣👌👌", "😉😁😁😊👏", "😱🤩🤩🤩🤩🤩🤩🤩"];
var negativo = ["🤔😢😢😢😢😢", "😔😔😔😓😓", "😦😦😦😦😦😦😦😦😦"]
function replyRandom(ctx, what){
	var msg;
	if(what == 'Positivo'){
		msg = positivo[Math.floor(Math.random() * positivo.length)];
	}else{
		msg = negativo[Math.floor(Math.random()*negativo.length)];
	}
	ctx.reply(msg)
}
bot.launch()
