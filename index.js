
require("dotenv").config();
var keys = require("./keys.js");
var axios = require("axios");
var Spotify = require("node-spotify-api");
var inquirer = require("inquirer");
var moment = require('moment');
var fs = require("fs");
var spotify = new Spotify(keys.spotify);

var divider = `\n--------------------------\n`

const doMovie = "movie-this";
const doSong = "spotify-this-song";
const doConcert = "concert-this";

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
                name: "Band Tour Dates",
                value: "concert-this"
            },
            {
                name: "Song Information",
                value: "spotify-this-song",
            },
            {
                name: "Movie Information",
                value: "movie-this"
            },
            {
                name: "Do What It Says!",
                value: "Do-what-it-says"
            }],
        name: "source"

    }

]).then(function (response) {
    if (response.source === doConcert) {
        appendRand(response.source);
        inquirer.prompt([
            {
                type: "input",
                message: "What band would you like to see?",
                name: "band",
                default: "Neko Case",
                validate: isBlank
            }
        ]).then(function (response) {
            var bandName = response.band;
            findIt.concertFind(bandName);

        })

    } else if (response.source === doSong) {
        appendRand(response.source);
        inquirer.prompt([
            {
                type: "input",
                message: "What song are you searching for?",
                name: "song",
                default: "No Matter What You Do",
                validate: isBlank
            }
        ]).then(function (response) {
            var songName = response.song;
            findIt.songFind(songName);

        })
    } else if (response.source === doMovie) {
        appendRand(response.source);
        inquirer.prompt([
            {
                type: "input",
                message: "What movie are you searching for?",
                name: "movie",
                default: "Being There",
                validate: isBlank
            }
        ]).then(function (response) {
            var movieName = response.movie;
            findIt.movieFind(movieName);


        })
    } else {

        random();

    }

})

const isEven = (num) => {
    if (num % 2 == 0) {
        return true;
    } else {
        return false;
    }
}

const isBlank = (val) => {
    if(!val) {
        return "You cannot submit a blank value."
    } else {
        return true; 
}
}


var random = () => {
    fs.readFile("random.txt", "utf8", function (error, data) {

        if (error) {
            return console.log(error);
        }

        let dataArr = data.split(",");
        let index = Math.floor(Math.random() * dataArr.length);


        if ((index === 0) || (isEven(index))) {
            let index2 = index++;
            let source = dataArr[index];
            let term = dataArr[index2];
            console.log(source, term);
            if (source === doMovie) {

                findIt.movieFind(term);

            } else if (source === doConcert) {
                let term = dataArr[index2];
                findIt.concertFind(term);

            } else if (source === doSong) {
                let term = dataArr[index2];
                findIt.songFind(term);
            } else {

            }

        } else {

        }
    }
    )}


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
                appendRand(bandName);
                fs.appendFile("log.txt", `${divider}\n query: ${url} \n\n ${JSON.stringify(showData)}`, function (err) {
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
            appendRand(movieName);
            fs.appendFile("log.txt", `${divider}\n query: ${url} \n\n ${JSON.stringify(showData)}`, function (err) {
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
            for (let i = 0; i < song.artists.length; i++) {
                showData.artists.push(song.artists[i].name);
            }
            console.log(`Song Title: ${showData.title}`);
            console.log(`Artist(s): ${showData.artists.join(", ")}`);
            console.log(`Preview URL: ${showData.url}`);
            console.log(`Album: ${showData.album}`);
            appendRand(songName);
            fs.appendFile("log.txt", `${divider}\n query: ${url} \n\n ${JSON.stringify(showData)}`, function (err) {
                if (err) throw err;

            });

        });
    },

}




