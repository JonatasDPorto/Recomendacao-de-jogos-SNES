/*
	SISTEMA DE RECOMENDAÇÃO DE JOGOS SNES
	UTILIZANDO "Sistema de Recomendação Colaborativo".toUppercase() // kkk




*/


//IMPOTAÇÕES E DECLARACÕES


const Markup = require('telegraf/markup')
const Datastore = require('nedb')
const Extra = require('telegraf/extra')
var db = {};

db.rates = new Datastore('db/rates.db');
db.genres = new Datastore('db/genres.db');
db.games = new Datastore('db/games.db');
db.users = new Datastore('db/users.db');
db.top10 = new Datastore('db/top10.db');
db.recommendations = new Datastore('db/recommendations.db');
db.similarity = new Datastore('db/similarity.db');

db.rates.loadDatabase();
db.genres.loadDatabase();
db.games.loadDatabase();
db.users.loadDatabase();
db.top10.loadDatabase();
db.recommendations.loadDatabase();
db.similarity.loadDatabase();



////////////////////////////////////////////////////////////////////



//RETORNA UMA LISTA DE JOGOS QUE UM DETERMINADO USUARIO DEU RATE. 
//OBS : DOCS = lista{user_id, game_id, rate}
const get_games_by_user = (_user) => new Promise((resolve, reject) =>{
	db.rates.find({user_id: Number(_user)}, function(err, docs){
		if(err != null)reject();
    	resolve(docs);
  	});
})

//RETORNA UMA LISTA DE USUARIOS QUE UM DETERMINADO GAME RATEADO. 
//OBS : DOCS = lista{user_id, game_id, rate}
const get_users_by_game = (_game) => new Promise((resolve, reject) =>{
	db.rates.find({game_id: Number(_game)}, function(err, docs){
		if(err != null)reject();
    	resolve(docs);
  	});
})

//RETORNA UMA LISTA DE RATES QUE UM DETERMINADO USUARIO E GAME. 
//OBS : DOCS = lista{user_id, game_id, rate}
const get_rate_by_user_game = (_user, _game) => new Promise((resolve, reject) =>{
	db.rates.find({user_id: Number(_user), game_id: Number(_game)}, function(err, docs){
		if(err != null)reject();
		if(docs.length == 0){
			resolve([]);
		}else{
			resolve(docs[0]);
		}
    	
  	});
})

//RETORNA UMA LISTA DE RATES QUE UM DETERMINADO USUARIO. 
//OBS : DOCS = lista{user_id, game_id, rate}
const get_rate_by_user = (_user) => new Promise((resolve, reject) =>{
	db.rates.find({user_id: Number(_user)}, function(err, docs){
		if(err != null)reject();
		resolve(docs);
  	});
})


//RETORNA UMA LISTA DE GAMES QUE UM DETERMINADO USUARIO NÃO DEU RATE. 
//OBS : RESULT = lista{user_id, game_id, rate}
async function get_all_games_not_rated_by_user(_user_id){
	
	var games = await get_all_games();
	var gr = await get_rate_by_user(_user_id);
	var gamesRated = Array.from(gr, x => x.game_id)

	var result = []
	for(i in games){
		if(!gamesRated.includes(games[i])){
			result.push(games[i])
		}
	}
	return result;

}

//RETORNA UMA LISTA DE GAMES DE UM DETERMINADO GENERO. 
//OBS : DOCS = lista{id, name, description, release_date, developer, genre, imageURL}
exports.get_game_by_genre = (_genre) => new Promise((resolve, reject) =>{
	db.games.find({genre: new RegExp(_genre, 'gi')}, function(err, docs){
		if(err != null)reject();
    	resolve(docs);
  	});
})

//RETORNA A LISTA DE GENEROS. 
exports.get_all_genres = () => new Promise((resolve, reject) =>{
	db.genres.find({}, function(err, docs){
		if(err != null)reject();
		var result = []
		for(i in docs){
			result.push(docs[i].genre)
		}
    	resolve(result);
  	});
})
//RETORNA A LISTA DE USUARIOS. 
const get_all_users = () => new Promise((resolve, reject) =>{
  	db.users.find({}).sort({ user_id: 1 }).skip(1).exec(function (err, docs) {
	  	if(err != null)reject();
		var result = []
		for(i in docs){
			result.push(docs[i].user_id)
		}
    	resolve(result);

	}); 

})
//RETORNA A LISTA DE GAMES. 
const get_all_games = () => new Promise((resolve, reject) =>{
  	db.games.find({}).sort({ user_id: 1 }).skip(1).exec(function (err, docs) {
	  	if(err != null)reject();
		var result = []
		for(i in docs){
			result.push(docs[i].id)
		}
    	resolve(result);

	}); 

})

const get_game_by_id = (_game_id) => new Promise((resolve, reject) =>{
	db.games.find({id: _game_id}, function(err, docs) {
	  	if(err != null)reject();
	  	if(docs.length == 0)reject();
    	resolve(docs[0]);

	}); 
})

const get_game_mean = (_game_id) => new Promise((resolve, reject) =>{
	db.rates.find({game_id: _game_id}, function(err, docs){
		if(err != null)reject();
		if(docs.length == 0)reject();
		var rates = 0;
		for(i in docs){
			rates += docs[i].rate;
		}
		db.games.find({id: _game_id}, function(err2, docs2){
			if(err2 != null)reject();
			if(docs2.length == 0)reject();
			resolve({game_id: _game_id, mean: rates/docs.length, name: docs2[0].name, imageURL: docs2[0].imageURL})
		})		
	})
})

//RETORNA A LISTA COM O TOP 10 JOGOS MAIS BEM AVALIADOS
exports.getTop10 = () => new Promise((resolve, reject) =>{	
	db.top10.find({}).sort({ mean: -1 }).skip(1).limit(10).exec(function(err, docs){
		if(err != null)reject();
		if(docs.length == 0)reject();
		resolve(docs)
		updateTop10()
	})
	
})
async function updateTop10(){
	var games = await get_all_games()
	var promisses = []
	for(i in games){
		promisses.push(get_game_mean(Number(games[i])))

	}
	var rates = []
	Promise.all(promisses)
	   .then((values) => {

	       	values.forEach((game)=>{
	       		//db.top10.insert(game)
	       		db.top10.update({game_id:game.game_id}, {$mean: game.mean})
	       	})
	   		
	   		console.log("Top10 atualizado!!")
	   })
	   .catch(err => {  
	     // catch if single promise fails to resolve
	   });
}
//RETORNA A LISTA DE GAMES QUE DOIS USUARIOS TEM EM COMUM. 
async function intersect_games_by_user_user(_user_id_x, _user_id_y){

	var ratingsX = [];
	var ratingsY = [];
	var x = await get_games_by_user(_user_id_x)
	var y = await get_games_by_user(_user_id_y)
	for(i in x){
		for (j in y) {
			if(x[i].game_id == y[j].game_id){
				ratingsX.push(x[i]);
				ratingsY.push(y[j])
			}
		}
	}
	return [ratingsX, ratingsY]

}

//RETORNA A SIMILARIDADE ENTRE DOIS USUARIOS
async function similarity(_user_id_x, _user_id_y){

 	[ratings_x, ratings_y] = await intersect_games_by_user_user(_user_id_x, _user_id_y);
 	if(ratings_x.length == 0){
 		return 0.0;
 	}
 	mean_rating_x = meanRates(ratings_x)
    mean_rating_y = meanRates(ratings_y)
    

    ratings_x_less_mean = arrayRatesLessRate(ratings_x , mean_rating_x);
    ratings_y_less_mean = arrayRatesLessRate(ratings_y , mean_rating_y);
    numerador = sum(multiplyArray(ratings_x_less_mean, ratings_y_less_mean))

	den_x = sum(powArray(ratings_x_less_mean))
	den_y = sum(powArray(ratings_y_less_mean))
   
   	var denominador = Math.sqrt((den_x * den_y));

   	if(denominador == 0){
   		return 0.0;
   	}

    similarity_value = numerador / Math.sqrt((den_x * den_y))

    return similarity_value

}
function mean(array){
	return sum(array)/array.length
}
function sum(array){
	return array.reduce((a, b) => a + b, 0);
}
function powArray(array){
	return Array.from(array, x => Math.pow(x, 2))
}
function meanRates(rates){
	var value = 0;
	for(i in rates){
		value += Number(rates[i].rate);
	}
	return value/rates.length;
}
function arrayRatesLessRate(arr, value){
	var a = arr;
	for(i in a){
		a[i] = Number(a[i].rate) - value
	}
	return a
}
function multiplyArray(arr1, arr2){
	var arr = []
	for(i in arr1){
		arr.push(arr1[i]*arr2[i])
	}
	return arr;
}

//ADICIONA UM RATE NA BASE DE DADOS
exports.rate = (_user_id, _game_id, _rate) => new Promise((resolve, reject) => {

	db.rates.find({user_id: Number(_user_id), game_id: Number(_game_id)}, function(err, docs){
		if(err != null)reject();
		if(docs.length == 0){
			db.rates.insert({user_id: Number(_user_id), game_id: Number(_game_id), rate: Number(_rate)}, function (err, d) {
				resolve();
			});
		}else{
			db.rates.update({user_id: Number(_user_id), game_id: Number(_game_id)}, { $set: { rate: Number(_rate) } }, function (err, numReplaced) {
				resolve();
			});
		}
		
	})
})

exports.createUser = (_user_id) => new Promise((resolve, reject) =>{
	db.users.find({user_id: Number(_user_id)}, function(err, docs){
		if(err != null)reject();
		if(docs.length == 0){
			
			db.users.insert({user_id: Number(_user_id)}, function(err2, docs2){
				if(err2 != null)reject();
				resolve()
				return;
			})
		}else{
			resolve();
		}
		
	})
})

exports.insertSimilarity = async function(){
	var  users = await get_all_users();
	var result = []
	var jaSimilarados = []
	for (var i = 0; i < users.length; i++) {
		for (var j = 0; j < users.length; j++) {
			if(users[i] == users[j])continue;
			if(jaSimilarados.includes(users[j]))continue;
			var sim = await similarity(users[i], users[j]);
			var obj = {
				user_1: users[i],
				user_2: users[j],
				similarity: sim
			}
			result.push(obj)
		}
		jaSimilarados.push(users[i]);
		console.log(i)
	}
	await db.similarity.insert(result, function (err, d) {
		return;
	});
}

exports.updateSimilarityFor = async function(_user_id){
	var  users = await get_all_users();
	for (var i = 0; i < users.length; i++) {
		if(users[i] == _user_id)continue;
		var sim = await similarity(_user_id, users[i]);
		var obj = {
			user_1: _user_id,
			user_2: users[i],
			similarity: sim
		}
		var query = {$or: [{user_1: _user_id, user_2: users[i]}, {user_1: users[i], user_2: _user_id}]};
		await usf(query, obj)
		
	}

}
const usf = (query, obj) => new Promise((resolve, reject) =>{
	db.similarity.find(query , function(err, docs){
		if(docs.length == 0){
			db.similarity.insert(obj, function(err, docs){
				if(err != null)reject();
				resolve();
			});
		}else{
			db.similarity.update(query, obj, function(err, docs){
				if(err != null)reject();
				resolve();
			});
		}
	})


})

const get_topneighbors_rateditem = (_user_id, _game_id, N) => new Promise((resolve, reject) =>{
	get_users_by_game(_game_id).then((lista)=>{
		var result = []
		for (var i = 0; i < lista.length; i++) {
			if(lista[i].user_id != _user_id){
				result.push({user_1: _user_id, user_2: Number(lista[i].user_id)})
			}
		}
		db.similarity.find({ $or: result }).sort({ similarity: -1 }).skip(1).limit(N).exec(function(err, l){
			if(err != null)reject();
			resolve(l);
		})
	})
})

const get_most_similar = (_user_id) => new Promise((resolve, reject) =>{

	db.similarity.find({ $or: [{user_1: Number(_user_id)}, {user_2: Number(_user_id)}] }).sort({ similarity: -1 }).skip(1).limit(1).exec(function(err, l){
		if(err != null)reject();
		if(l.length < 1)reject();
		resolve(l[0]);
	})

})
//TODO
const predict_rating = async function(_user_id, _game_id){
    
    var N = 20
    
    var rates = await get_rate_by_user(_user_id);
    
    var all_user_values = Array.from(rates, x => x.rate)
    
    var mean_user = mean(all_user_values)
    
    var topN_users = await get_topneighbors_rateditem(_user_id, _game_id, N)
    
    var sum_ = 0
    var sum_k = 0
    
    for(i in topN_users){ 
        var similarity = topN_users[i].similarity
        var user_u = topN_users[i].user_2
        
        var rating_user_u = await get_rate_by_user_game(user_u, _game_id);
        
        var items_user_u = await get_games_by_user(user_u)
        
        
        mean_user_u = meanRates(items_user_u)
        
        sum_ += similarity * (rating_user_u.rate - mean_user_u)

        sum_k += Math.abs(similarity)
    }

    var k
    if(sum_k == 0){
        k = 0
    }
    else{
        k = 1 / sum_k
    }
    
    rating_final = mean_user + k * sum_
    
    return rating_final
}

const getRecommendation = async function(_user_id, N){
	console.log(_user_id)
	var result = []
	var gamesNotRated = await get_all_games_not_rated_by_user(_user_id)
	console.log(gamesNotRated.length)
	for(i in gamesNotRated){
		console.log(i)
		var g = Number(gamesNotRated[i])
		var p = await predict_rating(_user_id, gamesNotRated[i])
		var gm = await get_game_by_id(g)
		result.push({game_id: g, rate: p, name: gm.name, imageURL: gm.imageURL})
	}
	result.sort(function comparar(a, b) {
	  if (a.rate > b.rate) {
	    return -1;
	  }
	  if (a.rate < b.rate) {
	    return 1;
	  }
	  // a deve ser igual a b
	  return 0;
	})
	return result.slice(0, N);
}

const getPreRecommendation = (_user_id) => new Promise((resolve, reject) =>{
	db.recommendations.find({id: Number(_user_id)}, function (err, docs) {
	  	if(err != null)reject();
	  	if(docs.length == 0){
	  		resolve([])
	  		return;
	  	}
    	resolve(docs[0].recommendation);

	}); 
})
const setAllRecommendations = async function(){
	var users = await get_all_users();

	users.forEach((user)=>{
		getRecommendation(user, 10).then((top)=>{
			var obj = {
				id: user,
				recommendation: top
			}
			db.recommendations.insert(obj)
		})
		
	})
}

exports.recommendForMe = (_user_id) => new Promise((resolve, reject) =>{
	//VE SE JA TEM UMA RECOMENDAÇÃO CARREGADA
	getPreRecommendation(_user_id).then((pre) =>{
		//SE TIVER RETORNA A RECOMEDAÇÃO E COLOCA PRA ATUALIZAR 
		if(pre.length > 0){
			console.log("Pre Recomendação enviada ao usuario!")
			getRecommendation(_user_id, 10).then((rec) =>{
				console.log("Recomendação do usuario atualizada!")
				console.log(rec)
				db.recommendations.update({id: Number(_user_id)}, { $set: { recommendation: rec } }, { multi: true });
			});
			resolve(pre);

		//SE NAO TIVER RETORNA A RECOMENDAÇÃO DO USUARIO MAIS SIMILAR A ELE ENQUANDO ISSO CALCULA A RECOMENDAÇÃO PRA ELE
		}else{
			get_rate_by_user(_user_id).then((rates)=>{
				//SE NAO TIVER DADO RATE EM NENUM JOGO CANCELA E REJEITA
				if(rates.length == 0){
					console.log("Usuario nao possui rates suficientes!")
					reject();
					return;
				}

					//CALCULA A SIMILARIDADE PRA SÓ PRA ELE
				exports.updateSimilarityFor(_user_id).then(()=>{
					//RETORNA O TOP 10 DO USUARIO MAIS SIMILAR
					console.log("Similaridade do usuario atualizada!")
					get_most_similar(_user_id).then((x)=>{
						console.log("Usuario mais similar calculado, retorna a Recomendação do similar!")
						if(x.user_1 == _user_id){
							getPreRecommendation(x.user_2).then((xx)=>{
								resolve(xx)
							})
						}else{
							getPreRecommendation(x.user_1).then((xx)=>{
								resolve(xx)
							})
						}
						
						
					}).then(()=>{
						console.log("Calculando recomndacao!" + _user_id)
						//CALCULA O TOP 10 DELE ENQUANTO ISSO
						getRecommendation(Number(_user_id), 10).then((top)=>{
							console.log("Recomendação do usuario calculado!")
							var obj = {
								id: _user_id,
								recommendation: top
							}
							db.recommendations.insert(obj)
						})
					})
					
				})

			})
			
				

		}
	})

	

})




//FUNÇÃO QUE RETORNA OS JOGOS, FORMATADO PARA O INLINE COISINHA LA
exports.inlineQuery = (str) => new Promise((resolve, reject) =>{

  db.games.find({ name: new RegExp(str, 'gi') }, function (err, docs) {
    if(err != null)reject();
    result = []
    for(i in docs){
      var obj = Obj(docs[i].id, docs[i].name, docs[i].genre, docs[i].imageURL);
      result.push(obj);
      if(i == 9)break;
    }
    resolve(result);
  });
});

//QUERY COMUM PESQUISA DEPENDENDO DO QUE TEM NO OBJ, NOME, ID, GENERO, ETC
exports.newQuery = (obj) => new Promise((resolve, reject) =>{
  //FORMATA O NAME PARA ELE PEQUISE COMO SUBTRING E INCASESENTIVESESFK
  if(obj.name != undefined){
    obj.name = new RegExp(obj.name, 'gi');
  }
  //PESQUISA E RETORNA THAT SIMPLE
  db.games.find(obj, function(err, docs){
    resolve(docs);
  });
});

//CRIAR O OBJETO PARA A INLINE QUERY
function Obj(_id, _title, _genre, _url) {

  var obj = {
    type: 'article',
    id: _id,
    title: _title,
    description: _genre,
    thumb_url: _url,
    input_message_content: {
      message_text: `<a href=\"${_url}\">${_title}</a>`,
      parse_mode: "HTML",
      disable_web_page_preview: false
    },
    reply_markup: Markup.inlineKeyboard([
        {
          text: "Avaliar",
          callback_data: `avaliar!${_id}`,
        }
      ])

  }
  return obj;
}
