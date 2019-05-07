
require("dotenv").config();
var keys = require("./keys.js");
var axios = require("axios");
var Spotify = require("node-spotify-api");
var inquirer = require("inquirer");
var moment = require('moment');
var fs = require("fs");
var spotify = new Spotify(keys.spotify);

var divider = `\n--------------------------\n`
var op;

const appendRand = (cont) => {
    fs.appendFile("random.txt", `${cont},`, function (err) {
        if (err) throw err;

    });
} 

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
    checkInput(response.source);
    if (op === 1) {
        appendRand(response.source);
        inquirer.prompt([
            {
                type: "input",
                message: "What band would you like to see?",
                name: "band"
            }
        ]).then(function (response) {
            var bandName = response.band;
            appendRand(bandName);
            findIt.concertFind(bandName);

        })

    } else if (op === 2) {
        appendRand(response.source);
        inquirer.prompt([
            {
                type: "input",
                message: "What song are you searching for?",
                name: "song"
            }
        ]).then(function (response) {
            var songName = response.song;
            appendRand(songName);
            findIt.songFind(songName);

        })
    } else if (op === 3) {
        appendRand(response.source);
        inquirer.prompt([
            {
                type: "input",
                message: "What movie are you searching for?",
                name: "movie"
            }
        ]).then(function (response) {
            var movieName = response.movie;
            appendRand(movieName);
            findIt.movieFind(movieName.toLowerCase());


        })
    } else {

        random();

    }

})

const checkInput = (input) => {
    if(input === "movie-this") {
        op = 1;
    } else if(input = "spotify-this-song") {
        op = 2;
    } else if(input = "concert-this") {
        op = 3;
    } else {
        op = 0;
    }
}


var random = () => {
    fs.readFile("random.txt", "utf8", function (error, data) {

        if (error) {
            return console.log(error);
        }

        let dataArr = data.split(",");

        let index = Math.floor(Math.random() * dataArr.length);
        let index2 = index++;
        let source = dataArr[index];
        checkInput(source);
        console.log(source);

        if(op === 1) {
            let term = dataArr[index2];
            findIt.movieFind(term);
            
        } else if(op === 2){
            let term = dataArr[index2];
            findIt.concertFind(term);
            
        } else if ( op === 3) {
            let term = dataArr[index2];
            findIt.songFind(term);
        } else {
            dataArr.find();
        }
    });
}


var findIt = {

    concertFind: function (bandName) {
        console.log(divider);
        console.log(`Searching for tour dates for ${bandName}...`);
        let url = `https://rest.bandsintown.com/artists/${bandName}/events?app_id=codingbootcamp`;
        console.log(url);
        axios.get(url, function (err) {
            if (err) {
                console.log(`Error occurred: ${err}`);
                return;
            }


        }).then(function (response) {
            let shows = response.data;
            for (let i = 0; i < shows.length; i++) {
                let showData = {
                    show: shows[i].datetime,
                    bands: shows[i].lineup.join(', '),
                    venue: shows[i].venue.name,
                    loc: `${shows[i].venue.city}, ${shows[i].venue.region} ${shows[i].venue.country}`
                };
                console.log(divider);
                console.log(`Date: ${moment().format(showData.show)}`);
                console.log(`Venue name: ${showData.venue}`);
                console.log(`Location: ${showData.loc}`);
                console.log(`Lineup: ${showData.bands}`);
                fs.appendFile("log.txt", showData, function (err) {
                    if (err) throw err;

                });
            }


        });

    },

    movieFind: function (movieName) {
        console.log(divider);
        console.log(`Searching for info for ${movieName}...:`);
        let url = `https://www.omdbapi.com/?t=${movieName}&y=&plot=short&apikey=trilogy`;
        axios.get(url, function (err) {
            if (err) {
                console.log(`Error occurred: ${err}`);
                fs.appendFile("log.txt", err);
                return;
            }

        }).then(function (response) {
            let showData = {
                title: response.data.Title,
                year: response.data.Year,
                imdb: response.data.Ratings[0].Value,
                rtr: response.data.Ratings[1].Value,
                lang: response.data.Language,
                country: response.data.Country,
                plot: response.data.Plot,
                actors: response.data.Actors
            }
            console.log(divider);
            console.log(`Title: ${showData.title}`);
            console.log(`Year: ${showData.year}`);
            console.log(`IMDB Rating: ${showData.imdb}`);
            console.log(`Rotten Tomatoes Rating: ${showData.rtr}`);
            console.log(`Country: ${showData.country}`);
            console.log(`Language: ${showData.lang}`);
            console.log(`Plot: ${showData.plot}`);
            console.log(`Actors: ${showData.actors}`);

            fs.appendFile("log.txt", showData, function (err) {
                if (err) throw err;

            });

        });

    },

    songFind: function (songName) {
        console.log(divider);
        console.log(`Searching for info for ${songName}...`);
        spotify.search({ type: `track`, query: `${songName}` }, function (err, data) {
            if (err) {
                console.log(`Error occurred: ${err}`);
                return;
            }
            console.log(divider);
            let song = data.tracks.items[0];
            let showData = {
                artists: [],
                title: song.name,
                url: song.preview_url,
                album: song.album.name
            }
            for(let i = 0; i < song.artists.length; i++) {
                showData.artists.push(song.artists[i].name);
            }
            console.log(`Song Title: ${showData.title}`);
            console.log(`Artist(s): ${showData.artists.join(", ")}`);
            console.log(`Preview URL: ${showData.url}`);
            console.log(`Album: ${showData.album}`);

            fs.appendFile("log.txt", showData, function (err) {
                if (err) throw err;

            });

        });
    },

}




