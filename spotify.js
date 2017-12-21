'use strict';

const CLIENT_ID = 'eb6dfffda5534bb5996e872487be4321';

const getFromApi = function (endpoint, query = {}) {
  // You won't need to change anything in this function, but you will use this function 
  // to make calls to Spotify's different API endpoints. Pay close attention to this 
  // function's two parameters.

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
  });
};

let artist;
let concurrentTopTracks = [];

const getArtist = function (name) {
  let query = {
    q: name,
    limit: 1,
    type: 'artist'
  };
  return getFromApi('search', query)
    .then( (item) => {
      artist = item.artists.items[0];
      return getFromApi(`artists/${artist.id}/related-artists`);
    })
    .then( (item) => { 
      artist.related = item.artists;
      for (let i=0; i < artist.related.length; i++) {
        concurrentTopTracks.push(getFromApi(`artists/${artist.related[i].id}/top-tracks`));
      }
      console.log('what is concurrentTopTracks',concurrentTopTracks);
      return Promise.all(concurrentTopTracks) //a promise that resolves with an array of results from previous promises
    })
    // .then( (items)) => {
    //   artist. = item.tracks

    // }     
    // .then( (item) => {
      
    //   console.log('what is item after related artists', item);

    // })
    .catch(error => console.log(`Whoops! Something went wrong. We had the following error: ${error}`));
};

// Promise.all(concurrentTopTracks).then(results => {
//   return artists.
// })

getArtist();





// =========================================================================================================
// IGNORE BELOW THIS LINE - THIS IS RELATED TO SPOTIFY AUTHENTICATION AND IS NOT NECESSARY  
// TO REVIEW FOR THIS EXERCISE
// =========================================================================================================
const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8080/auth.html';

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
