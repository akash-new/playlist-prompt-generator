interface SpotifyTrack {
    uri: string;
    name: string;
    artists: { name: string }[];
}

interface SpotifyTrackDetails {
    id: string;
    name: string;
    artist: string;
    previewUrl: string | null;
    imageUrl: string;
    uri: string;
}

export async function createPlaylist(token: string, playlistSuggestion: PlaylistSuggestion) {
    try {
        // Get user's Spotify ID
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const userData = await userResponse.json();
        
        // Create a new playlist
        const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistSuggestion.name,
                description: `AI-generated playlist based on: ${playlistSuggestion.name}`,
                public: false
            })
        });
        const playlistData = await playlistResponse.json();

        // Search and add each song
        const trackUris = [];
        for (const songQuery of playlistSuggestion.songs) {
            const searchResponse = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(songQuery)}&type=track&limit=1`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const searchData = await searchResponse.json();
            if (searchData.tracks.items.length > 0) {
                trackUris.push(searchData.tracks.items[0].uri);
            }
        }

        // Add tracks to playlist
        if (trackUris.length > 0) {
            await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: trackUris
                })
            });
        }

        return {
            playlistUrl: playlistData.external_urls.spotify,
            tracks: trackUris.map((uri, index) => ({
                id: index.toString(),
                name: playlistSuggestion.songs[index].split(' - ')[0],
                artist: playlistSuggestion.songs[index].split(' - ')[1]
            }))
        };
    } catch (error) {
        console.error('Error creating playlist:', error);
        throw new Error('Failed to create playlist');
    }
}

export async function searchTrackWithDetails(token: string, query: string): Promise<SpotifyTrackDetails | null> {
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        const data = await response.json();
        
        if (data.tracks.items.length > 0) {
            const track = data.tracks.items[0];
            console.log('Track preview URL:', track.preview_url);
            return {
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                previewUrl: track.preview_url,
                imageUrl: track.album.images[1]?.url || track.album.images[0]?.url,
                uri: track.uri
            };
        }
        return null;
    } catch (error) {
        console.error('Error searching track:', error);
        return null;
    }
} 