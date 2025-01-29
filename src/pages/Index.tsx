import { useState } from "react";
import { SpotifyAuth } from "@/components/SpotifyAuth";
import { SongList } from "@/components/SongList";
import { ShareButtons } from "@/components/ShareButtons";
import { toast } from "sonner";

interface Song {
  id: string;
  name: string;
  artist: string;
}

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylist = async () => {
    setIsCreating(true);
    try {
      // TODO: Implement Spotify playlist creation
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      toast.success("Playlist created successfully!");
    } catch (error) {
      toast.error("Failed to create playlist. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveSong = (songId: string) => {
    setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));
  };

  return (
    <div className="min-h-screen bg-spotify-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-white mb-4">AI Playlist Generator</h1>
          <p className="text-spotify-lightgray">
            Enter a prompt to generate a custom Spotify playlist
          </p>
        </div>
        
        <SpotifyAuth onSongsGenerated={setSongs} />
        
        {songs.length > 0 && (
          <div className="mt-8">
            <SongList
              songs={songs}
              onCreatePlaylist={handleCreatePlaylist}
              isCreating={isCreating}
              onRemoveSong={handleRemoveSong}
            />
          </div>
        )}

        <ShareButtons />
      </div>
    </div>
  );
};

export default Index;