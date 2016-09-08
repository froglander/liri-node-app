var fs = require('fs');
var inquirer = require('inquirer');
var moment = require('moment');
var COMMAND_FILE = "random.txt";
var LOG_FILE = "log.txt";


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
			var outputMovie = writeMovie(JSON.parse(body));

			console.log(outputMovie);

			fs.appendFile(LOG_FILE, outputMovie, function(err) {
				if (err) throw err;
			});			
		}
		askAgain();
	});
}
/* ************************************************************	*/
/* Method : writeMovie											*/
/* Parameters : body											*/
/* Description : This function takes the JSON results and 		*/
/*				 creates a string that can be returned for 		*/
/*				 writing to screen or file 						*/
/* ************************************************************	*/
function writeMovie(body) {
	var outputString = "";
	outputString += "==============================================================================="
	outputString += "\nTitle:                  " + body.Title;
	outputString += "\nYear:                   " + body.Year;
	outputString += "\nIMDB Rating:            " + body.imdbRating;
	outputString += "\nCountry where produced: " + body.Country;
	outputString += "\nLanguage:               " + body.Language;
	outputString += "\nPlot:                   " + body.Plot;
	outputString += "\nRotten Tomatoes rating: " + body.tomatoRating;
	outputString += "\nRotten Tomatoes url:    " + body.tomatoURL;
	outputString += "\n===============================================================================\n";

	return outputString;	
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
	var Twitter = require('twitter');

	var client = new Twitter (keys.twitterKeys);
	var twitterUser;
	if (user == '') {
		twitterUser = 'polyhimnia';
	} else {
		twitterUser = user;
	}

	var params = {screen_name: twitterUser};

	client.get('statuses/user_timeline', params, function(error, tweets, response) {	
		if(!error) {
			var outputTweets = writeTweets(tweets, twitterUser);		
			console.log(outputTweets);
			fs.appendFile(LOG_FILE, outputTweets, function(err) {
				if (err) throw err;
			});			
			askAgain();
		} else {
			console.log(error);
		}
	});
} // end my_tweets

/* ************************************************************	*/
/* Method : writeTweets											*/
/* Parameters : tweets, user									*/
/* Description : This function takes the JSON results and 		*/
/*				 creates a string that can be returned for 		*/
/*				 writing to screen or file 						*/
/* ************************************************************	*/
function writeTweets(tweets, user) {
	var outputString = "";
	outputString += "*******************************************************************************";
	outputString += "\n               Most recent 20 tweets for user @"+ user;	
	outputString += "\n*******************************************************************************";
	tweets.forEach(function(tweet) {	
		outputString += "\n===============================================================================";
		outputString += "\n" + tweet.text;
		// Use momentjs to format the time and show in current timezone (twitter returns the time in UTC)
		outputString += "\n" + moment(tweet.created_at, "ddd MMM D HH:mm:ss Z YYYY").format("h:mm A D MMM YYYY");
	});
	outputString += "\n===============================================================================\n";
	return outputString;
}

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
			var outputSong = writeSong(results);
			console.log(outputSong);
			fs.appendFile(LOG_FILE, outputSong, function(err) {
				if (err) throw err;
			});	

			askAgain();
			
	}, function(err) {
		console.log('Something went wrong!', err);
	});
}
/* ************************************************************	*/
/* Method : writeSong											*/
/* Parameters : song 											*/
/* Description : This function takes the JSON results and 		*/
/*				 creates a string that can be returned for 		*/
/*				 writing to screen or file 						*/
/* ************************************************************	*/
function writeSong(results) {	
	var outputString = "";
	results.forEach(function(song) {
		outputString += "\n===============================================================================";
	 	outputString += "\nArtist(s):" + getArtists(song.artists);		    
	    outputString += "\nSong name:" +song.name;
	    outputString += "\nPreview link:" + song.preview_url;
	    outputString += "\nAlbum:"+ song.album.name;
	});
	outputString += "\n===============================================================================\n";
	return outputString;
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

/* ************************************************************	*/
/* Method : do_what_it_says										*/
/* Parameters : none	 										*/
/* Description : This function takes the text inside random.txt	*/
/*				 and calls the indicated command.  The default 	*/
/*				 command is spotify "I Want it That Way"		*/
/* ************************************************************	*/
function do_what_it_says () {	
	fs.readFile(COMMAND_FILE, 'utf8', function(err, data) {		
		if(err) {
			return console.log(err);
		}
		var dataArray = data.split(',');
		var liriCommand = dataArray[0];
		var liriParameter = dataArray[1];

		var liriChoice = {
			"my_tweets": function() {
				my_tweets(liriParameter);
			},
			"spotify_this_song": function() {
				spotify_this_song(liriParameter);
			},
			"movie_this": function() {
				movie_this(liriParameter);
			}
		} // end liriChoice

		liriChoice[liriCommand]();
	});
}
/* ************************************************************	*/
/* Function that asks user if they want to ask Liri something 	*/
/* else and if so, calls the askLiri function, otherwise it 	*/
/* prints a goodbye message and the program ends. 				*/
/* ************************************************************	*/
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
				do_what_it_says();
			}
		} // end liriChoice

		liriChoice[choices.liriDo]();
	});
	//prompt
}

askLiri();


