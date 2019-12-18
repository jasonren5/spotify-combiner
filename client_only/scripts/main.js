/* primary script file for main.html */


//variable for the spotify player instance
//const player;


$(document).ready(function () {
    //waits for playback sdk to be ready... there is probably a better spot for this
    window.onSpotifyWebPlaybackSDKReady = () => {
        let params = getHashParams();
        console.log(params);
        access_token = params.access_token;

        //if user is not logged in, access token is false
        if (access_token) {
            //initializeWebPlayer();
            console.log("logged in");
            $("#not-logged-in").hide();
            $("#logged-in").show();

            let userProfilePlaceholder = document.getElementById("userprofile");
            //ajax to api to request profile
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    $('#login').hide();
                    $('#loggedin').show();
                    loginSuccess(response);
                }
            });
        } else {
            $("#not-logged-in").show();
            $("#logged-in").hide();
        }
    };
});

//after the SDK is loaded, instantiate the player object
//cite https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
function initializeWebPlayer() {
    const player = new Spotify.Player({
        name: 'Easy-DJ Player',
        getOAuthToken: callback => {
            // Run code to get a fresh access token

            callback(access_token);
        },
        volume: 0.9
    });

    // Error handling
    player.addListener('initialization_error', ({
        message
    }) => {
        console.error(message);
    });
    player.addListener('authentication_error', ({
        message
    }) => {
        console.error(message);
    });
    player.addListener('account_error', ({
        message
    }) => {
        console.error(message);
    });
    player.addListener('playback_error', ({
        message
    }) => {
        console.error(message);
    });

    // Playback status updates
    player.addListener('player_state_changed', state => {
        console.log(state);
    });

    // Ready
    player.addListener('ready', ({
        device_id
    }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({
        device_id
    }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.connect().then(success => {
        if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
            let $button = $("<button>", {
                type: "button",
                text: "play song"
            });

            //attach listener at element creation
            $button.on("click", function () {
                handleStartButton();
            });
            $("#playback-container .col-12").append($button);
        }
    });

}

//grabs list of user's playlists and returns the .items of the request (array of the actual playlists)
async function getPlaylists() {
    const result = await $.ajax({
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        error: function () {
            console.log("error fetching playlists!");
            return;
        }
    });

    return result.items;
}

//grabs list of user's spotify devices
function populateDevices() {
    const result = $.ajax({
        url: 'https://api.spotify.com/v1/me/player/devices',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        error: function () {
            console.log("error fetching devices!");
            return;
        }
    })

    //successfully grabbed devices list
    result.done(function (data) {
        console.log(data);
        let $dropdown = $("#device-dropdown");
        data.devices.forEach(function (device) {
            console.log(device);
            $dropdown.append($("<option>", {
                value: device.id,
                text: device.name
            }));
        });
    });

    //failed to grab devices list
    result.fail(function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus + ': ' + errorThrown);
    });
}

function renderPlaylists(playlists) {
    let $list = $("#all-list .list").first();
    $list.empty();

    for (let i = 0; i < playlists.length; i++) {
        let $card = $('<div>', {
            playlist_id: playlists[i].id,
            class: "playlist-card"
        });

        //append image
        $card.append($('<img>', {
            playlist_id: playlists[i].id,
            src: playlists[i].images[playlists[i].images.length - 1].url,
            height: 60,
            width: 60
        }));
        //append name
        $card.append($('<span>', {
            text: playlists[i].name,
            playlist_id: playlists[i].id,
        }));

        $card.append($("<input>", {
            type: "range",
            min: 0,
            max: 10,
            value: 0,
            class: "slider",
            playlist_id: playlists[i].id
        }));

        $list.append($card);

    }

}

//is called in document.ready if the access token is defined
async function loginSuccess(data) {
    $("#display-name").text(data.display_name);
    if (data.product == "premium") {
        console.log("Is premium user");
    } else {
        alert("Sorry! The account you logged in with is not a Spotify Premium account. Due to limitiations of the API, this application will only work with Spotify Premium or Family Plan accounts.");
        return;
    }
    if (data.images.length > 0) {
        //console.log("image!");
        //console.log(data.images[0].url);
        $("#profile-picture-container").prepend($("<img>", {
            src: data.images[0].url,
            alt: "user profile picture",
            id: "profile-picture"
        }));
    }


    //console.log("user data: ");
    //console.log(data);

    //create device list
    populatePlayBar();

    let playlists = await getPlaylists();

    //now build playlists
    //console.log("playlists: ");
    //console.log(playlists);
    renderPlaylists(playlists);
}


/*
    checks all .slider inputs and calculates cumWeight, the sum of all the slider inputs.
        then calculates a probability for each playlistbetween 0 and 1, 
        and then assigns them a range from 0 to 1.

    ex: playlist 1 has value 1, playlist 2 has value 2.
        'range' assigned to playlist 1 is .33, and 'range' for 2 is 1.
        s.t. a random between 0 and 1 has a .33 chance to fall in playlist 1's range,
        and a .66 chance to fall in playlist 2's range.
*/
function calculatePlaylistWeight() {
    //first find playlists that have a value non-zero, add to cumWeight,
    //then calculate percentage of total values
    let $sliders = $(".slider");

    let active_lists = [];
    let cumWeight = 0;

    $sliders.each(function () {
        cumWeight += parseInt($(this).val());
    });

    //push each array to the active_lists with its percentage of the total weight as the first element
    let cumWeightPercent = 0;
    $sliders.each(function () {
        if (parseInt($(this).val()) != 0) {
            active_lists.push([(parseInt($(this).val()) / cumWeight) + cumWeightPercent, $(this).attr("playlist_id")]);
            cumWeightPercent += parseInt($(this).val()) / cumWeight;
        }
    });

    console.log(active_lists);
    return active_lists;
}

//is called when the button is pressed
function handleStartButton() {
    let lists = calculatePlaylistWeight();

    if (lists.length == 0) {
        alert("Error: No playlists chosen");
        return;
    }

    //
    let songRand = Math.random();
    let playlistId = -1;
    console.log(songRand);
    for (let i = 0; i < lists.length; i++) {
        if (songRand < lists[i][0]) {
            playlistId = lists[i][1];
            break;
        }
    }

    if (playlistId == -1) {
        console.log("error: no playlist detected");
        return;
    }

    //at this point, playlistId contains a playlist ID
    //  now turn it into a spotify URI and pass it to playSong
    //  example uri: spotify:album:1Je1IMUlBXcx1Fz0WE7oPT
    //  https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/

    let playlist = "spotify:playlist:" + playlistId;
    console.log(playlist);
    playSong(playlist);

}

/*
    playSong sends a request to spotify API to play the given spotify uri
*/
function playSong(spotify_uri) {
    const device = $("#device-dropdown").val();
    console.log("device id: " + device);
    console.log("access_token: " + access_token);

    const play = $.ajax({
        url: 'https://api.spotify.com/v1/me/player/play?device_id=' + encodeURIComponent(device),
        type: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        },
        data: JSON.stringify({
            context_uri: spotify_uri
        }),
        success: function (data) {
            console.log("successfully played song?");
            console.log(data);
        },
        error: function (request, status, error) {
            console.log("Status: " + status + ", repsonse: " + request.responseText);
        }
    });
}


//populates the playbar at the bottom of the page with device list, play button, etc
function populatePlayBar() {
    populateDevices();

    //add playbutton
    let $button = $("<button>", {
        type: "button",
        text: "play song"
    });

    //attach listener at element creation
    $button.on("click", function () {
        handleStartButton();
    });
    $("#playback-container .col-12").append($button);
}