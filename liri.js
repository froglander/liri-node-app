var keys = require("./keys.js");
var fs = require('fs');
var inquirer = require('inquirer');


/* ************************************************************	*/
/* Method : movie_this											*/
/* Parameters : movieName										*/
/* Description : This function takes a movieName parameter and 	*/
/*				 after receiving a response from omdbapi it 	*/
/*				 displays it. If no movie is entered it 		*/
/*				 defaults to the movie Mr. Nobody				*/
/* ************************************************************	*/
function movie_this (movieName) {
	var request = require('request');
	if (movieName.length == 0) {
		var movieName = "Mr. Nobody";
	}
	var queryUrl = 'http://www.omdbapi.com/?t=' + movieName + '&y=&plot=short&r=json&tomatoes=true';

	request(queryUrl, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			//console.log(JSON.parse(body));
			console.log("===============================================================================");
			console.log("Title:", JSON.parse(body).Title);
			console.log("Year:", JSON.parse(body).Year);
			console.log("IMDB Rating:", JSON.parse(body).imdbRating);
			console.log("Country where produced:", JSON.parse(body).Country);
			console.log("Language:", JSON.parse(body).Language);
			console.log("Plot:", JSON.parse(body).Plot);
			console.log("Rotten Tomatoes rating:", JSON.parse(body).tomatoRating);
			console.log("Rotten Tomatoes url:", JSON.parse(body).tomatoURL);
			console.log("===============================================================================");
		}
		askAgain();
	});
}
/* ************************************************************	*/
/* Method : my_tweets											*/
/* Parameters : user 											*/
/* Description : This function takes a user parameter and after	*/
/*				 receiving a response from twitter it displays 	*/
/*				 the last 20 tweets for the user. If no user is */
/*				 entered it defaults to my account @polyhimnia	*/
/* ************************************************************	*/
function my_tweets (user) {
	var keys = require("./keys.js");
	var moment = require('moment');
	var Twitter = require('twitter');

	var client = new Twitter (keys.twitterKeys);

	if (user == '') {
		var params = {screen_name: 'polyhimnia'};
	} else {
		var params = {screen_name: user};
	}

	client.get('statuses/user_timeline', params, function(error, tweets, response) {	
		if(!error) {
			console.log("Most recent 20 tweets for user @"+ params.screen_name);	
			tweets.forEach(function(tweet) {	
				console.log("===============================================================================");
				console.log(tweet.text);	
				// Use momentjs to format the time and show in current timezone (twitter returns the time in UTC)
				console.log(moment(tweet.created_at, "ddd MMM D HH:mm:ss Z YYYY").format("h:mm A D MMM YYYY"));
			});		
			console.log("===============================================================================");
			askAgain();
		} else {
			console.log(error);
		}
	});
} // end my_tweets

/* ************************************************************	*/
/* Method : spotify_this_song									*/
/* Parameters : song 											*/
/* Description : This function takes a song parameter and after	*/
/*				 receiving a response from spotify it displays 	*/
/*				 it. If no song is entered it defaults to		*/
/*				 The Sign by Ace of Base. It retrieves 5 song	*/
/*				 results in case the song you were thinking of 	*/
/*				 has been done by multiple artists.				*/
/* ************************************************************	*/
function spotify_this_song(song) {
	var SpotifyWebApi = require("spotify-web-api-node");
	var spotifyApi = new SpotifyWebApi();
	if (song == '') {
		var track = "track:'The Sign' artist:'Ace of Base'";
	} else {
		var track = song;
		//var track = song.split(" ").join('+');	
	}

	spotifyApi.searchTracks(track , {limit : 5 })
		.then(function(data) {			
			var results = data.body.tracks.items;	// To make it easier to refer to the results
			results.forEach(function(song) {
				console.log("===============================================================================");
			 	console.log("Artist(s):", getArtists(song.artists));		    
			    console.log("Song name:", song.name);
			    console.log("Preview link:", song.album.external_urls.spotify);
			    console.log("Album:", song.album.name);
			});
			console.log("===============================================================================");

			askAgain();
			
	}, function(err) {
		console.log('Something went wrong!', err);
	});
}

/* ************************************************************	*/
/* Method : getArtists											*/
/* Parameters : artists 										*/
/* Description : This function takes the artists from the 		*/
/*				 response and retrieves all of them if there 	*/
/*				 multiple and returns it. 						*/
/* ************************************************************	*/
function getArtists(artists) {
	var artistArray = [];
	artists.forEach(function(artist) { 
		artistArray.push(artist.name);
	});
	return artistArray.join(", ");
}

function askAgain() {
	inquirer.prompt({
        name   : "again",
        type   : "confirm",
        message: "Would you like to ask Liri something else?"
        }).then(function(answer) {
            if (answer.again == true) {
                askLiri();
            } else {
                console.log("Liri is waiting!");
            }
        });
}

/* ************************************************************	*/
/* Main loop of program. Displays menu and calls the correct	*/
/* function depending on the user's choice.						*/
/* ************************************************************	*/
function askLiri () {
	inquirer.prompt([{
		type: "list",
		name: "liriDo",
		message: "What should Liri do?",
		choices: ["Show tweets", "Spotify this song", "Movie this", "Do what it says"]
	}]).then(function(choices) {
		//console.log(choices.liriDo);

		var liriChoice = {
			"Show tweets" : function () {
				inquirer.prompt([{
					type: "input",
					name: "user",
					message: "What user's tweets would you like to look up?"
				}]).then(function(userObj) {					
					my_tweets(userObj.user);
				});	
			},
			"Spotify this song": function () {
				inquirer.prompt([{
					type: "input",
					name: "song",
					message: "What song would you like to look up?"			
				}]).then(function(songObj) {					
					spotify_this_song(songObj.song);
				});
			},
			"Movie this": function() {
				inquirer.prompt([{
					type: "input",
					name: "movie",
					message: "What movie would you like to look up?"			
				}]).then(function(promptObj) {					
					movie_this(promptObj.movie);
				});			
			},
			"Do what it says": function() {
				// do stuff
			}
			} // end liriChoice

			liriChoice[choices.liriDo]();
	});
	//prompt
}

askLiri();


