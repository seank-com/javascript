/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

var http = require('http'),
    fs = require('fs'),
    querystring = require('querystring'),
    argv = process.argv,
    argc = argv.length,
    movies = [
        "A Single Shot",
        "A.C.O.D.",
        "About Time",
        "As I Lay Dying",
        "Austenland",
        "Best Man Down",
        "Blue Jasmine",
        "Captain Phillips",
        "Carrie",
        "Chasing Amy",
        "Cloudy with a Chance of Meatballs 2",
        "Coal Miner's Daughter",
        "Dallas Buyers Club",
        "Deep Impact",
        "Dirty Moviep",
        "Dogma",
        "Enough Said",
        "Escape Plan",
        "Exploding Sun",
        "Filth",
        "Free Birds",
        "Get Lucky",
        "How I Live Now",
        "Impact",
        "In a World",
        "Last Vegas",
        "Machete Kills",
        "Moby Dick",
        "Never Let Me Go",
        "Paranormal Movie",
        "Plush",
        "Rush",
        "Short Term",
        "Social Nightmare",
        "Song of the South",
        "Tequila Sunrise",
        "The Beach Girls",
        "The Children's Hour",
        "The Fifth Estate",
        "The Hunger Games - Catching Fire",
        "The Necessary Death of Charlie Countryman",
        "The Other Side Of Heaven",
        "Vendetta",
        "Wild Child",
        "You're Next"
    ];

function getJSON(options, onResult) {
    "use strict";

    var req = http.request(options, function (res) {
        var output = '';

        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function (err) {
        console.log(err);
    });

    req.end();
}

function getMovie(imdbID, onResult) {
    "use strict";

    var options = {
        host: 'www.omdbapi.com',
        port: 80,
        path: '/?' + querystring.stringify({ 'i': imdbID}),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    getJSON(options, onResult);
}

function processMovieResult(statusCode, result) {
    "use strict";

    var cover,
        title,
        year,
        rated,
        genre,
        actors,
        director,
        plot,
        rating;

    if (statusCode === 200) {
        cover = result.Poster;
        title = result.Title.replace(/"/g, "$&$&");
        year = result.Year.replace(/"/g, "$&$&");
        rated = result.Rated.replace(/"/g, "$&$&");
        genre = result.Genre.replace(/"/g, "$&$&");
        actors = result.Actors.replace(/"/g, "$&$&");
        director = result.Director.replace(/"/g, "$&$&");
        plot = result.Plot.replace(/"/g, "$&$&");
        rating = result.imdbRating.replace(/"/g, "$&$&");

        if (cover !== 'N/A') {
            console.log('"' +
                cover + '","' +
                title + '","' +
                year + '","' +
                rated + '","' +
                genre + '","' +
                actors + '","' +
                director + '","' +
                plot + '","' +
                rating + '"');
        }
    }
}

function searchMovies(title, onResult) {
    "use strict";

    var options = {
        host: 'www.omdbapi.com',
        port: 80,
        path: '/?' + querystring.stringify({ 's': title}),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    getJSON(options, onResult);
}

function processSearchResults(statusCode, result) {
    "use strict";

    var countResults = 0,
        j = 0;

    if (statusCode === 200 && result.hasOwnProperty('Search')) {
        countResults = result.Search.length;
        for (j = 0; j < countResults; j += 1) {
            if (result.Search[j].Type === 'movie') {
                getMovie(result.Search[j].imdbID, processMovieResult);
            }
        }
    }
}

function processMovies() {
    "use strict";

    var countMovies = movies.length,
        title = '',
        i = 0;

    for (i = 0; i < countMovies; i += 1) {
        title = movies[i];

        searchMovies(title, processSearchResults);
    }
}

function main(argc, argv) {
    "use strict";

    if (argc !== 2) {
        console.log('usage: %s %s', argv[0], argv[1]);
    } else {
        console.log("cover,title,year,rated,genre,actors,director,plot,rating");
        processMovies();
    }
}

main(argc, argv);
