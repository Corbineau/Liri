
require("dotenv").config();
var keys = require("./keys.js");
var axios = require("axios");
var Spotify = require("node-spotify-api");
var inquirer = require("inquirer");
var moment = require('moment');
var fs = require("fs");
var spotify = new Spotify(keys.spotify);

var divider = `\n--------------------------\n`

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
            console.log(movieName);
            findIt.movieFind(movieName.toLowerCase());


        })
    } else {
        fs.readFile("random.txt", "utf8", function(error, data) {

        if (error) {
            return console.log(error);
        }
        console.log(data);

        var dataArr = data.split(",");
        console.log(dataArr);

    });
        //     findIt.songFind();

    }

})



var findIt = {

    concertFind: function (bandName) {
        let url = `https://rest.bandsintown.com/artists/${bandName}/events?app_id=codingbootcamp`;
        console.log(url);
        axios.get(url, function (err) {
            if (err) {
                console.log(`Error occurred: ${err}`);
                return;
            }
           

        }).then(function(response){
            console.log(divider);
            console.log(response);
            let showData = {
                // venue: response.venue,
                // location: 


            }

            fs.appendFile("log.txt", showData, function (err) {
                if (err) throw err;

            });
        });

    },

    movieFind: function (movieName) {
        let url = `https://www.omdbapi.com/?t=${movieName}&y=&plot=short&apikey=trilogy`;
        console.log(url);
        axios.get(url, function (err) {
            if (err) {
                console.log(`Error occurred: ${err}`);
                fs.appendFile("log.txt", err);
                return;
            }
            
        }).then(function(response){
            console.log(response.data);
            let showData = {
                title: response.data.Title,
                year: response.data.Year,
            }
            console.log(divider);
            console.log(
                showData.title,
                showData.year
            );

            fs.appendFile("log.txt", showData, function (err) {
                if (err) throw err;

            });

        });

    },

    songFind: function (songName) {
        spotify.search({ type: `track`, query: `${songName}` }, function (err, data) {
            if (err) {
                console.log(`Error occurred: ${err}`);
                return;
            }
            console.log(divider);
            let showData = JSON.stringify(data.tracks);
            console.log(showData);

            fs.appendFile("log.txt", showData, function (err) {
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