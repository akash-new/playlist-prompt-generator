import { Button } from "@/components/ui/button";
import { Loader2, Music, X } from "lucide-react";
import { toast } from "sonner";

interface Song {
  id: string;
  name: string;
  artist: string;
}

interface SongListProps {
  songs: Song[];
  onCreatePlaylist: () => void;
  isCreating: boolean;
  onRemoveSong?: (songId: string) => void;
}

export const SongList = ({ songs, onCreatePlaylist, isCreating, onRemoveSong }: SongListProps) => {
  if (!songs.length) return null;

  const handleRemoveSong = (songId: string) => {
    if (onRemoveSong) {
      onRemoveSong(songId);
      toast.success("Song removed from list");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 space-y-4 animate-slideUp">
      <div className="bg-spotify-darkgray rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-bold text-white">Generated Songs</h2>
        <ul className="space-y-2">
          {songs.map((song) => (
            <li
              key={song.id}
              className="flex items-center justify-between p-2 hover:bg-spotify-black/50 rounded transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Music className="text-spotify-green h-5 w-5" />
                <div>
                  <p className="text-white font-medium">{song.name}</p>
                  <p className="text-spotify-lightgray text-sm">{song.artist}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-spotify-lightgray hover:text-white"
                onClick={() => handleRemoveSong(song.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        <Button
          onClick={onCreatePlaylist}
          disabled={isCreating || songs.length === 0}
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