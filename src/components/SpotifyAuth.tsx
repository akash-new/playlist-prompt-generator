import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CLIENT_ID = "your_client_id"; // We'll need to set this up securely
const REDIRECT_URI = window.location.origin;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPE = "playlist-modify-public playlist-modify-private";

export const SpotifyAuth = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("spotify_token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        ?.split("=")[1] ?? null;

      window.location.hash = "";
      if (token) {
        window.localStorage.setItem("spotify_token", token);
      }
    }

    setToken(token);
  }, []);

  const logout = () => {
    window.localStorage.removeItem("spotify_token");
    setToken(null);
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex justify-center p-4">
      {!token ? (
        <Button
          className="bg-spotify-green hover:bg-spotify-green/90 text-white"
          onClick={() =>
            window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`
          }
        >
          Login with Spotify
        </Button>
      ) : (
        <Button
          variant="outline"
          className="text-spotify-green border-spotify-green hover:bg-spotify-green/10"
          onClick={logout}
        >
          Logout
        </Button>
      )}
    </div>
  );
};