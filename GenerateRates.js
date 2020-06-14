const Datastore = require('nedb')

var Recommendation = require('./Recommendation.js')
var fs = require('fs'),
    readline = require('readline');

const numero_usuarios = 100;




/*
async function create(menor, maior){
	try{
		console.log("create ")
		var genres = await Recommendation.get_all_genres()
		var genresToRemove = genres.slice();
		for (var i = 0; i < numero_usuarios; i++) {

			if(genresToRemove.length == 0){
				genresToRemove = genres.slice();
			}

			var g = Math.floor(Math.random() * genresToRemove.length);

			var games = await Recommendation.get_game_by_genre(genresToRemove[g]);
			await Recommendation.createUser(i)
			for(j in games){
				var r = Math.floor(Math.random() * (maior - menor + 1)) + menor;
				var obj = {user_id: i, game_id: games[j].id, rate: r}
				await Recommendation.rate(obj)
				//

			}
			
			genresToRemove.splice(g, 1);

		}
		
	}catch(err){
		console.log(err)
	}
	console.log("1 leva")
}
*/

var logger = fs.createWriteStream('./db/rates.csv', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
var toSave = "user_id,game_id,rate,genre_1,genre_2,genre_3,genre_4,genre_5,genre_6,genre_7,genre_8,genre_9,genre_10\n";
logger.write("user_id,game_id,rate,genre_1,genre_2,genre_3,genre_4,genre_5,genre_6,genre_7,genre_8,genre_9,genre_10\n")
async function create(menor, maior){
	try{
		console.log("create ")
		var genres = await Recommendation.get_all_genres()
		var genresToRemove = genres.slice();
		for (var i = 0; i < numero_usuarios; i++) {
			var genresAlreadyTaken = []
			if(genresToRemove.length == 0){
				genresToRemove = genres.slice();
			}


			var g = Math.floor(Math.random() * genresToRemove.length);
			var games = await Recommendation.get_game_by_genre(genresToRemove[g]);
			
			for(j in games){
				if(toSave.includes(`${Number(i)},${Number(games[j].id)}`))break;

				var r = Math.floor(Math.random() * (maior - menor + 1)) + menor;


				var game_genre = arrayToCSVType(games[j].genre)
				toSave += `${i},${games[j].id},${r},${game_genre}\n`
				logger.write(`${i},${games[j].id},${r},${game_genre}\n`)	

			}
			
			genresToRemove.splice(g, 1);

		}
		
	}catch(err){
		console.log(err)
	}
	console.log("1 leva")
}


function CSVtoDB(){
	var rd = readline.createInterface({
	    input: fs.createReadStream('./db/rates.csv'),
	    //output: process.stdout,
	    console: false
	});
	var ja = []
	rd.on('line', function(line) {
	    var args = line.split(',')
	    if(args[0] == 'user_id')return;
	    if(!ja.includes(args[0])){
	    	Recommendation.createUser(args[0]);
	    	ja.push(args[0])
	    }
	  
	    Recommendation.rate(args[0], args[1], args[2])
	});
}

function arrayToCSVType(string){
	var s = ""
	var array = string.split(' ,')
	for(i in array){
		if(i == array.length-1){
			s += array[i]
			continue;
		}
		s += array[i]+','
	}
	return s;
}

CSVtoDB();

/*
create(4,5);
create(3,4);
create(2,3);
create(1,2);
create(1,5);*/