import { useState } from "react";
import { SpotifyAuth } from "@/components/SpotifyAuth";
import { PromptInput } from "@/components/PromptInput";
import { SongList } from "@/components/SongList";
import { toast } from "sonner";

interface Song {
  id: string;
  name: string;
  artist: string;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);

  const handlePromptSubmit = async (prompt: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement AI integration to generate songs based on prompt
      // For now, we'll use mock data
      const mockSongs: Song[] = [
        { id: "1", name: "Song 1", artist: "Artist 1" },
        { id: "2", name: "Song 2", artist: "Artist 2" },
        { id: "3", name: "Song 3", artist: "Artist 3" },
      ];
      setSongs(mockSongs);
    } catch (error) {
      toast.error("Failed to generate songs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-spotify-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-white mb-4">AI Playlist Generator</h1>
          <p className="text-spotify-lightgray">
            Enter a prompt to generate a custom Spotify playlist
          </p>
        </div>
        
        <SpotifyAuth />
        
        <div className="mt-8">
          <PromptInput onSubmit={handlePromptSubmit} isLoading={isLoading} />
          <SongList
            songs={songs}
            onCreatePlaylist={handleCreatePlaylist}
            isCreating={isCreating}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;