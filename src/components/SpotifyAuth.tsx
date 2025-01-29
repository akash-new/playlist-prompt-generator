import { useState, useEffect, useRef } from 'react';
import { createPlaylist, searchTrackWithDetails } from '../services/spotifyService';
import { toast } from 'sonner';
import { generatePlaylistPrompt } from '../services/geminiService';
import { X, LogOut, Play, Pause, Music } from 'lucide-react';
import { MusicPlayer } from './MusicPlayer';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
    "playlist-modify-public",
    "playlist-modify-private",
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state"
];

const SAMPLE_PROMPTS = [
    "Create a workout playlist with high-energy pop and hip-hop",
    "Make a relaxing evening playlist with acoustic indie songs",
    "Generate a road trip playlist with classic rock hits",
    "Create a focus playlist with instrumental electronic music",
    "Make a party playlist with current top dance hits"
];

interface SpotifyAuthProps {
    onSongsGenerated: (songs: Array<{ id: string; name: string; artist: string }>) => void;
}

interface CreatedPlaylist {
    name: string;
    url: string;
}

interface SongWithDetails {
    id: string;
    name: string;
    artist: string;
    previewUrl: string | null;
    imageUrl: string;
    uri: string;
}

export function SpotifyAuth({ onSongsGenerated }: SpotifyAuthProps) {
    const [token, setToken] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [suggestedPlaylist, setSuggestedPlaylist] = useState<{
        name: string;
        songs: SongWithDetails[];
    } | null>(null);
    const [createdPlaylist, setCreatedPlaylist] = useState<CreatedPlaylist | null>(null);
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<SongWithDetails | null>(null);

    useEffect(() => {
        const token = window.localStorage.getItem("spotify_token");
        setToken(token);
    }, []);

    // Rotate placeholder text
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % SAMPLE_PROMPTS.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const logout = () => {
        window.localStorage.removeItem("spotify_token");
        setToken(null);
    };

    const login = () => {
        const authUrl = `${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`;
        window.location.href = authUrl;
    };

    const handlePlayPreview = (songId: string, previewUrl: string | null) => {
        if (!previewUrl) {
            toast.error('No preview available for this song');
            return;
        }

        if (currentlyPlaying === songId) {
            audioRef.current?.pause();
            setCurrentlyPlaying(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(previewUrl);
            audioRef.current.play();
            setCurrentlyPlaying(songId);
            
            // Stop playing when preview ends
            audioRef.current.onended = () => {
                setCurrentlyPlaying(null);
            };
        }
    };

    const handleGeneratePlaylist = async () => {
        if (!prompt.trim() || !token) {
            toast.error('Please enter a prompt first');
            return;
        }

        setIsLoading(true);
        try {
            const playlistSuggestion = await generatePlaylistPrompt(prompt.trim());
            
            // Search for each song on Spotify and get details
            const songsWithDetails: SongWithDetails[] = [];
            for (const song of playlistSuggestion.songs) {
                const trackDetails = await searchTrackWithDetails(token, song);
                if (trackDetails) {
                    songsWithDetails.push(trackDetails);
                }
            }

            setSuggestedPlaylist({
                name: playlistSuggestion.name,
                songs: songsWithDetails
            });
            
            toast.success('Playlist generated! Review the songs and click "Add to Spotify" when ready.');
        } catch (error) {
            toast.error('Failed to generate playlist. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSong = (songId: string) => {
        if (!suggestedPlaylist) return;
        setSuggestedPlaylist({
            ...suggestedPlaylist,
            songs: suggestedPlaylist.songs.filter(song => song.id !== songId)
        });
    };

    const handleAddToSpotify = async () => {
        if (!token || !suggestedPlaylist) return;

        setIsLoading(true);
        try {
            const result = await createPlaylist(token, {
                name: suggestedPlaylist.name,
                songs: suggestedPlaylist.songs.map(song => `${song.name} - ${song.artist}`)
            });
            
            onSongsGenerated(result.tracks);
            
            // Store created playlist info and clear other states
            setCreatedPlaylist({
                name: suggestedPlaylist.name,
                url: result.playlistUrl
            });
            setSuggestedPlaylist(null);  // Clear the suggested playlist
            setPrompt('');
            
            // Open playlist in new tab
            window.open(result.playlistUrl, '_blank');
            
            toast.success('Playlist created successfully!');
        } catch (error) {
            toast.error('Failed to create playlist. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateNewPlaylist = () => {
        setSuggestedPlaylist(null);
        setCreatedPlaylist(null);
        setPrompt('');
    };

    const handlePlaySong = (song: SongWithDetails) => {
        setCurrentTrack(song);
    };

    const handleNextSong = () => {
        if (!suggestedPlaylist || !currentTrack) return;
        const currentIndex = suggestedPlaylist.songs.findIndex(song => song.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % suggestedPlaylist.songs.length;
        setCurrentTrack(suggestedPlaylist.songs[nextIndex]);
    };

    const handlePreviousSong = () => {
        if (!suggestedPlaylist || !currentTrack) return;
        const currentIndex = suggestedPlaylist.songs.findIndex(song => song.id === currentTrack.id);
        const previousIndex = currentIndex === 0 ? suggestedPlaylist.songs.length - 1 : currentIndex - 1;
        setCurrentTrack(suggestedPlaylist.songs[previousIndex]);
    };

    const handlePlayClick = (song: SongWithDetails) => {
        handlePlaySong(song);
    };

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto px-4 relative">
            {token && (
                <button
                    onClick={logout}
                    className="fixed top-4 right-4 flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded text-sm"
                >
                    <LogOut size={16} />
                    Disconnect
                </button>
            )}
            <div className="flex flex-col items-center gap-6 mt-12">
                {!token ? (
                    <button
                        onClick={login}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Connect Spotify
                    </button>
                ) : createdPlaylist ? (
                    // Success state - show only this when playlist is created
                    <div className="w-full max-w-md text-center">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-white text-xl font-bold mb-4">
                                🎉 Playlist Created!
                            </h3>
                            <p className="text-gray-300 mb-4">
                                "{createdPlaylist.name}" has been added to your Spotify library
                            </p>
                            <div className="flex gap-4 justify-center">
                                <a
                                    href={createdPlaylist.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
                                >
                                    Open in Spotify
                                </a>
                                <button
                                    onClick={handleGenerateNewPlaylist}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                >
                                    Create Another
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 w-full max-w-md">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={SAMPLE_PROMPTS[placeholderIndex]}
                            disabled={isLoading}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 bg-white placeholder-gray-500 disabled:bg-gray-100"
                        />
                        
                        {!suggestedPlaylist ? (
                            <button
                                onClick={handleGeneratePlaylist}
                                disabled={isLoading}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-2 px-4 rounded"
                            >
                                {isLoading ? 'Generating...' : 'Generate Playlist'}
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddToSpotify}
                                    disabled={isLoading}
                                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-2 px-4 rounded"
                                >
                                    {isLoading ? 'Adding to Spotify...' : 'Add playlist to Spotify'}
                                </button>
                                <button
                                    onClick={handleGenerateNewPlaylist}
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded"
                                >
                                    Generate Another
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {suggestedPlaylist && !createdPlaylist && (
                    <div className="w-full max-w-xl mx-auto bg-spotify-darkgray rounded-lg p-4">
                        <h3 className="text-xl font-bold text-white mb-4">{suggestedPlaylist.name}</h3>
                        <ul className="space-y-3">
                            {suggestedPlaylist.songs.map((song) => (
                                <li 
                                    key={song.id} 
                                    className="flex items-center justify-between p-3 bg-spotify-black/50 rounded-lg hover:bg-spotify-black/70 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-shrink-0 w-12 h-12 group cursor-pointer" onClick={() => handlePlayClick(song)}>
                                            {song.imageUrl ? (
                                                <>
                                                    <img 
                                                        src={song.imageUrl} 
                                                        alt={song.name}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {currentTrack?.id === song.id ? (
                                                            <Pause className="h-6 w-6 text-white" />
                                                        ) : (
                                                            <Play className="h-6 w-6 text-white" />
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center">
                                                    <Music className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{song.name}</p>
                                            <p className="text-spotify-lightgray text-sm">{song.artist}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePlayClick(song)}
                                            className="p-2 rounded-full bg-spotify-black text-spotify-lightgray hover:text-white transition-colors"
                                        >
                                            {currentTrack?.id === song.id ? (
                                                <Pause className="h-5 w-5" />
                                            ) : (
                                                <Play className="h-5 w-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleRemoveSong(song.id)}
                                            className="p-2 rounded-full hover:bg-spotify-black text-spotify-lightgray hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {token && currentTrack && (
                <MusicPlayer
                    token={token}
                    currentTrack={currentTrack}
                    onNext={handleNextSong}
                    onPrevious={handlePreviousSong}
                />
            )}
        </div>
    );
}