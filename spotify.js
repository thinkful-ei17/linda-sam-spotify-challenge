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
    return response.json(); //grabbing the json data from response object and returning whatever that value is 
  });
};

let artist = {}; //don't necessarily need to designate type, however, best practice is to do so. 

const getArtist = function (name) {
  let query = {
    q: name,
    limit: 1,
    type: 'artist'
  };
  return getFromApi('search', query)
    .then( (item) => { //response returned (result of response.json())
      artist = item.artists.items[0];
      return getFromApi(`artists/${artist.id}/related-artists`);
    }) //result of this getFromApi request
    .then( (relatedArtist) => { 
      artist.related = item.artists; //creating a new property on artist object, and the value is whatever artist you'll pull from the response - works because reference type rather than value type
      let concurrentTopTracks = []; //artist.related.map; map gets rid of creating extra variable (lines of code) - more chances to fail
      for (let i=0; i < artist.related.length; i++) { //can also (prefer map)artist.related
        concurrentTopTracks.push(getFromApi(`artists/${artist.related[i].id}/top-tracks`, { country : 'US' }));
      } //getFromApi is a promise function, just returning promise here without executing
      console.log('concurrentTopTracks', concurrentTopTracks); 
      return Promise.all(concurrentTopTracks);//all children complete, then parent resolves; if any one promise fails, then whole parent promise will reject and other promises //promise all is where it gets executed //a promise that resolves with an array of results from previous promises
    }) //result of getFromApi request (is a function, but request is more descriptive) is what gets pushed to concurrentTopTracks
    .then( (items) => {
      for (let i=0; i<items.length; i++){
        artist.related[i].tracks = items[i].tracks;
      }
      return artist;
    })
    .catch(error => console.log(`Whoops! Something went wrong. We had the following error: ${error}`));
};

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
