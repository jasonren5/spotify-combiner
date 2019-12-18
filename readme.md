#spotify-easy-dj

An application that allows any Spotify Premium user to easily playback from multiple playlists without having to manage their queue.

This web application can be accessed at my AWS EC2 server: http://ec2-18-191-207-59.us-east-2.compute.amazonaws.com/~jren/spotify-easy-dj/client_only/


##Notes

Spotify scopes used:
* streaming
    * Needed to control playback on the application.
    * Note: User requires a spotify premium account.
*  user-read-playback-state:
    * Needed to see currently playing track.
* playlist-read-collaborative:
    * Needed to get list of user's playlists.
* user-read-private
    * needed to check user's Spotify subscription, as the app only works with Spotify Premium subscribers.
* user-read-email
    * needed for Web Player SDK (they use it to check premium subscription)
* user-modify-playback-state
    * needed to start/resume playback