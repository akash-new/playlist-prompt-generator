import { Button } from "@/components/ui/button";
import { Loader2, Music } from "lucide-react";

interface Song {
  id: string;
  name: string;
  artist: string;
}

interface SongListProps {
  songs: Song[];
  onCreatePlaylist: () => void;
  isCreating: boolean;
}

export const SongList = ({ songs, onCreatePlaylist, isCreating }: SongListProps) => {
  if (!songs.length) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-8 space-y-4 animate-slideUp">
      <div className="bg-spotify-darkgray rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-bold text-white">Generated Songs</h2>
        <ul className="space-y-2">
          {songs.map((song) => (
            <li
              key={song.id}
              className="flex items-center space-x-3 p-2 hover:bg-spotify-black/50 rounded transition-colors"
            >
              <Music className="text-spotify-green h-5 w-5" />
              <div>
                <p className="text-white font-medium">{song.name}</p>
                <p className="text-spotify-lightgray text-sm">{song.artist}</p>
              </div>
            </li>
          ))}
        </ul>
        <Button
          onClick={onCreatePlaylist}
          disabled={isCreating}
          className="w-full bg-spotify-green hover:bg-spotify-green/90 text-white"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Playlist...
            </>
          ) : (
            "Create Playlist"
          )}
        </Button>
      </div>
    </div>
  );
};