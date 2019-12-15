$(document).ready(function () {
    let params = getHashParams();
    console.log(params);
    access_token = params.access_token;

    //if user is not logged in, access token is false
    if (access_token) {
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
});

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
    let names = "",
        buttons = "";

    // for (let i = 0; playlists.length; i++) {
    //     names += "<"
    // }
}


//global variable, is a JSON that holds all of the playlists
//let playlists;

//is called in document.ready if the access token is defined
async function loginSuccess(data) {
    $("#display-name").text(data.display_name);


    let playlists = await getPlaylists();

    //now build playlists

    console.log("playlists: ");
    console.log(playlists);

    //renderPlaylists(playlists);

}