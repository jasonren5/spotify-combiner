console.log("test js");
let client_id = '56a9a71a5af2441f99b9908d26ac8970';
let client_secret = '3fdbad3eaffc4d809bc28146ba9d5fd8';


$("#login-button").on("click", function() {
    console.log("button click");
    let scope = 'streaming user-read-playback-state playlist-read-collaborative';
    let redirect_uri = window.location.href;
    console.log(window.location.href);

    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    window.location = url;
});