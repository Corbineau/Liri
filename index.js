#! /usr/bin/env node
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
const doRandom = "do-what-it-says";

const appendRand = (cont) => {
    fs.appendFile("random.txt", `${cont},`, function (err) {
        if (err) throw err;

    });
}

const isEven = (num) => {
    if (num % 2 == 0) {
        return true;
    } else {
        return false;
    }
}

const isBlank = (val) => {
    if (!val) {
        return "You cannot submit a blank value."
    } else {
        return true;
    }
}

const runSearch = (source, term) => {
    if (source === doMovie) {

        findIt.movieFind(term);

    } else if (source === doConcert) {

        findIt.concertFind(term);

    } else if (source === doSong) {
        findIt.songFind(term);
    } else {
        console.log("your search returned no results.");
    }

};

const liriAsk = () => {
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
                    value: "do-what-it-says"
                }],
            name: "source"

        },
        {
            type: "input",
            message: "What band would you like to see?",
            name: "band",
            default: "Neko Case",
            when: function (response) {
                if (response.source === doConcert) {
                    return true;
                } else {
                    return false;
                }
            },
            validate: isBlank
        },
        {
            type: "input",
            message: "What song are you searching for?",
            name: "song",
            default: "No Matter What You Do",
            when: function (response) {
                if (response.source === doSong) {
                    return true;
                } else {
                    return false;
                }
            },
            validate: isBlank
        },
        {
            type: "input",
            message: "What movie are you searching for?",
            name: "movie",
            default: "Being There",
            when: function (response) {
                if (response.source === doMovie) {
                    return true;
                } else {
                    return false;
                }
            },
            validate: isBlank
        }

    ]).then(function (response) {
        if (response.source === doRandom) {
            return random();
        } else {
            let search = response.source;
            let query = response.band || response.song || response.movie;
            if (query) {
                appendRand(search);
                appendRand(query);
                runSearch(search, query);
            } else {
                return console.log("something went wrong");
            }

        }

    })
}

var random = () => {
    fs.readFile("random.txt", "utf8", function (error, data) {

        if (error) {
            return console.log(error);
        }

        let dataArr = data.split(",");
        let index = Math.floor(Math.random() * (dataArr.length - 1));
        let index2 = (index + 1);

        if ((index === 0) || (isEven(index))) {
            let source = dataArr[index];
            let term = dataArr[index2];
            // console.log("I should be even ", source, term);
            runSearch(source, term);

        } else {
            let source = dataArr[index2];
            let term = dataArr[index];
            // console.log("I should be odd ", source, term);
            runSearch(source, term);
        }

    }
    );
}

//so that we quit only when we quit.
const askAgain = () => {
    inquirer.prompt([
        {
            type: "confirm",
            message: "would you like to search again?",
            name: "ask_again"
        }
    ]).then(function (response) {
        if (response.ask_again) {
            liriAsk();
        } else {
            console.log("Thanks for using Liri! Goodbye!");
        }
    })
};

var findIt = {


    concertFind: function (bandName) {
        console.log(divider);
        console.log(`Searching for tour dates for ${bandName}...`);
        let url = `https://rest.bandsintown.com/artists/${bandName}/events?app_id=codingbootcamp`;
        axios.get(url, function (err) {
            if (err) {
                console.log(`Error occurred: ${err}`);
                return;
            }
        }).then(function (response) {
            let shows = response.data;
            let allDates = [];
            for (let i = 0; i < shows.length; i++) {
                let showData = {
                    date: moment(shows[i].datetime),
                    bands: shows[i].lineup.join(', '),
                    venue: shows[i].venue.name,
                    loc: `${shows[i].venue.city}, ${shows[i].venue.region} ${shows[i].venue.country}`
                };
                console.log(divider);
                console.log(`Date: ${showData.date}`);
                console.log(`Venue name: ${showData.venue}`);
                console.log(`Location: ${showData.loc}`);
                console.log(`Lineup: ${showData.bands}`);
                allDates.push(showData);    
            }
            return allDates;
        }).then(function (allDates) {
            fs.appendFile("log.txt", `${divider}\n query: ${url} \n\n ${allDates.join('\n')}`, function (err) {
                if (err) throw err;
            });
            askAgain();
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
            return showData
        }).then(function (showData) {
            fs.appendFile("log.txt", `${divider}\n query: ${url} \n\n ${JSON.stringify(showData)}`, function (err) {
                if (err) throw err;
            });
            askAgain();
        },
        );

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
            let cheater = Promise.resolve();
            cheater.then(function () {
                fs.appendFile("log.txt", `${divider}\n query: ${songName} \n\n ${JSON.stringify(showData)}`, function (err) {
                    if (err) throw err;
                })
                askAgain();
            }
            )
        })
    }



}




liriAsk();

