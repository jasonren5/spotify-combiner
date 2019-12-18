/* script file used on every page. idea is to put global variables and helper functions in core.js */

console.log("core initialized");
let client_id = '56a9a71a5af2441f99b9908d26ac8970';
let access_token;

//needed to get parameters such as the client access code from the spotify redirect
function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}