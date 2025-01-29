import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface MusicPlayerProps {
    token: string;
    currentTrack: {
        name: string;
        artist: string;
        imageUrl: string;
        uri: string;
    } | null;
    onNext: () => void;
    onPrevious: () => void;
}

export function MusicPlayer({ token, currentTrack, onNext, onPrevious }: MusicPlayerProps) {
    const [player, setPlayer] = useState<Spotify.Player | null>(null);
    const [deviceId, setDeviceId] = useState<string>('');
    const [isPaused, setIsPaused] = useState(true);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Playlist Generator Player',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
                setPlayer(player);
            });

            player.addListener('player_state_changed', state => {
                if (!state) return;
                setIsPaused(state.paused);
                setIsActive(true);
            });

            player.connect();
        };

        return () => {
            player?.disconnect();
        };
    }, [token]);

    useEffect(() => {
        if (currentTrack && player && deviceId) {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris: [currentTrack.uri],
                })
            }).catch(error => {
                console.error('Error playing track:', error);
                // Handle error (e.g., show toast message)
            });
        }
    }, [currentTrack, player, deviceId, token]);

    const togglePlay = () => {
        if (player) {
            player.togglePlay();
        }
    };

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-spotify-black p-4 border-t border-gray-800">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img 
                        src={currentTrack.imageUrl} 
                        alt={currentTrack.name} 
                        className="w-14 h-14 rounded"
                    />
                    <div>
                        <p className="text-white font-medium">{currentTrack.name}</p>
                        <p className="text-spotify-lightgray text-sm">{currentTrack.artist}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPrevious}
                        className="text-spotify-lightgray hover:text-white transition-colors"
                    >
                        <SkipBack className="h-5 w-5" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        {isPaused ? (
                            <Play className="h-5 w-5 text-black" />
                        ) : (
                            <Pause className="h-5 w-5 text-black" />
                        )}
                    </button>
                    <button
                        onClick={onNext}
                        className="text-spotify-lightgray hover:text-white transition-colors"
                    >
                        <SkipForward className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-spotify-lightgray" />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        className="w-24"
                        onChange={(e) => player?.setVolume(Number(e.target.value) / 100)}
                    />
                </div>
            </div>
        </div>
    );
} 