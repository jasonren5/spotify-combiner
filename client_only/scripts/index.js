/* primary script file for main.html */

//cite: https://github.com/spotify/web-api-auth-examples/blob/master/implicit_grant/public/index.html
$("#login-button").click(function (event) {
    event.preventDefault();
    console.log("button click");
    let scope = 'streaming user-read-playback-state playlist-read-collaborative user-read-email user-read-private user-modify-playback-state';
    let redirect_uri = window.location.href + "main.html";
    console.log(redirect_uri);

    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    window.location = url;
});