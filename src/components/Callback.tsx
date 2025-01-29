import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        // The token handling logic is moved here from SpotifyAuth
        const hash = window.location.hash;
        if (hash) {
            const token = hash
                .substring(1)
                .split("&")
                .find(elem => elem.startsWith("access_token"))
                ?.split("=")[1];

            if (token) {
                window.localStorage.setItem("spotify_token", token);
            }
        }
        // Redirect to home page after handling the token
        navigate('/');
    }, [navigate]);

    return <div>Loading...</div>;
} 