
require("dotenv").config();
var keys = require("./keys.js");
var axios = require("axios");
var spotify = require("node-spotify-api");
var inquirer = require("inquirer");
var moment = require('moment');
var fs = require("fs");



inquirer.prompt([
    {
        type: "list",
        message: "What are you looking for?",
        choices: [
            {
                message: "Band tour dates",
                name: "concert-this"
            },
            {
                message: "Song Information",
                name: "spotify-this-song",
            },
            {
                message: "Movie Information",
                name: "movie-this"
            },
            {
                message: "Do What It Says!",
                name: "Do-what-it-says"
            }],
        name: "source"

    }

]).then(function (response) {
    if (response.source === "concert-this") {
        inquirer.prompt([
            {
                type: "input",
                message: "What band would you like to see?",
                name: "band"
            }
        ]).then(function (response) {
            var bandName = response.band;
            findIt.concertFind(bandName);
        
        })

    } else if (response.source === "spotify-this-song") {
        inquirer.prompt([
            {
                type: "input",
                message: "What song are you searching for?",
                name: "song"
            }
        ]).then(function (response) {
            var songName = response.song;
            findIt.songFind(songName);

        })
    } else if (response.source === "movie-this") {
        inquirer.prompt([
            {
                type: "input",
                message: "What movie are you searching for?",
                name: "movie"
            }
        ]).then(function (response) {
            var movieName = response.movie;
            findIt.movieFind(movieName);

        })
    } else {
        // fs.readFile("random.txt") 
        //     findIt.songFind();
        
    }

})



var findIt = {
    
    concertFind: function(bandName) {
        axios.get(`https://rest.bandsintown.com/artists/${bandName}events?app_id=codingbootcamp`, function (err, data) {
                if (err) {
                    console.log(`Error occurred: ${err}`);
                    return;
                }
                console.log(data);
                fs.appendFile("log.txt", data, function(err) {
                    if (err) throw err;
    
                });

            });

    },
    
    movieFind: function(movieName) {
        axios.get(`http://www.omdbapi.com/?t=${movieName}&y=&plot=short&apikey=trilogy`, function (err, data) {
                if (err) {
                    console.log(`Error occurred: ${err}`);
                    return;
                }
                console.log(data);
                fs.appendFile("log.txt", data, function(err) {
                    if (err) throw err;
    
                });

            });

    },

    songFind: function(songName) {
        spotify.search({ type: `track`, query: `${songName}` }, function (err, data) {
            if (err) {
                console.log(`Error occurred: ${err}`);
                return;
            }
            console.log(data);
            fs.appendFile("log.txt", data, function(err) {
                if (err) throw err;

            });

        });
    },

}




// 3. To retrieve the data that will power this app, you'll need to send requests using the `axios` package to the Bands in Town, Spotify and OMDB APIs. You'll find these Node packages crucial for your assignment.

//    * [Node-Spotify-API](https://www.npmjs.com/package/node-spotify-api)

//    * [Axios](https://www.npmjs.com/package/axios)

//      * You'll use Axios to grab data from the [OMDB API](http://www.omdbapi.com) and the [Bands In Town API](http://www.artists.bandsintown.com/bandsintown-api)

//    * [Moment](https://www.npmjs.com/package/moment)

//    * [DotEnv](https://www.npmjs.com/package/dotenv)