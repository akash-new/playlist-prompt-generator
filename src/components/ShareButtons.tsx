import { FaWhatsapp, FaLinkedin } from 'react-icons/fa6';
import { AiFillInstagram } from 'react-icons/ai';

export function ShareButtons() {
    const shareUrl = window.location.href;
    const title = "AI Playlist Generator - Create Spotify playlists with AI!";
    const message = "Check out this awesome AI-powered Spotify playlist generator!";

    const shareToWhatsApp = () => {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message + ' ' + shareUrl)}`;
        window.open(whatsappUrl, '_blank');
    };

    const shareToLinkedIn = () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        window.open(linkedinUrl, '_blank');
    };

    const shareToInstagram = () => {
        // Instagram doesn't have a direct share URL, so we'll copy the link to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copied! Open Instagram and paste in your story or message.');
        });
    };

    return (
        <div className="flex flex-col items-center mt-8">
            <p className="text-white mb-4 text-sm">Share this app</p>
            <div className="flex gap-4">
                <button
                    onClick={shareToWhatsApp}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                    aria-label="Share on WhatsApp"
                >
                    <FaWhatsapp className="w-5 h-5 text-white" />
                </button>
                <button
                    onClick={shareToLinkedIn}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                    aria-label="Share on LinkedIn"
                >
                    <FaLinkedin className="w-5 h-5 text-white" />
                </button>
                <button
                    onClick={shareToInstagram}
                    className="p-2 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 rounded-full transition-colors"
                    aria-label="Share on Instagram"
                >
                    <AiFillInstagram className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
    );
} 