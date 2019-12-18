/* primary script file for main.html */

let player;


$(document).ready(function () {
    //waits for playback sdk to be ready... there is probably a better spot for this
    window.onSpotifyWebPlaybackSDKReady = () => {
        let params = getHashParams();
        console.log(params);
        access_token = params.access_token;

        //if user is not logged in, access token is false
        if (access_token) {
            initializeWebPlayer();
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
function initializeWebPlayer() {
    player = new Spotify.Player({
        name: 'Easy-DJ Player',
        getOAuthToken: callback => {
            // Run code to get a fresh access token

            callback(access_token);
        },
        volume: 0.9
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
                playSong()
            });
            $("#playback-container .col-12").append($button);
        }
    })


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
    if (data.images.length > 0) {
        console.log("image!");
        console.log(data.images[0].url);
        $("#profile-picture-container").prepend($("<img>", {
            src: data.images[0].url,
            alt: "user profile picture",
            id: "profile-picture"
        }));
    }

    console.log(data);

    let playlists = await getPlaylists();

    //now build playlists
    console.log("playlists: ");
    console.log(playlists);
    renderPlaylists(playlists);
}

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
function playSong() {
    let lists = calculatePlaylistWeight();
    if (lists.length == 0) {
        alert("Error: No playlists chosen");
        return;
    }
    let songRand = Math.random();
    let playlist = -1;
    console.log(songRand);
    for (let i = 0; i < lists.length; i++) {
        if (songRand < lists[i][0]) {
            playlist = lists[i][1];
            break;
        }
    }

    if (playlist != 0) {
        console.log(playlist);
    } else {
        console.log("error: no playlist detected")
    }
}