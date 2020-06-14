var rp = require('request-promise');
const Datastore = require('nedb')

db = {};
db.games = new Datastore('db/games.db');
db.games.loadDatabase();

var options = {
    uri: 'https://cache-api.ranker.com/lists/284049/items?limit=781&offset=25&include=votes%2CwikiText%2Crankings%2CopenListItemContributors%2CtaggedLists&propertyFetchType=ALL&liCacheKey=1b775258-0b7b-4eed-ad7b-45018211d3f2',
    json: true
};
var gamesList = [];

rp(options)
    .then(function (res) {
        createList(res.listItems);
    })
    .catch(function (err) {
        console.log("Erro!!!");
        console.log(err);

    });

function createList(list){
	for (il in list) {
		var i = list[il].node;
		var item = {};
		item.id = i.id;
		item.name = i.name;
		if(i.nodeWiki != undefined){
			item.description = i.nodeWiki.wikiText;
		}
		if(list[il].image != undefined){
			item.imageURL = list[il].image.url+"?fm=jpg";
		}
		for (jl in i.nodeProperties) {
			var j = i.nodeProperties[jl];
			if(j.propertyName == 'release_date'){
				item.release_date = j.propertyValue;
				
			}else 
			if(j.propertyName == 'cvg_genre'){
				item.genre = j.propertyValue;
			}else
			if(j.propertyName == 'developer'){
				item.developer = j.propertyValue;
			}
		}

		gamesList.push(item);
	}
	db.games.insert(gamesList, function (err, newDoc) {   // Callback is optional
		console.log(newDoc);
	});
}
