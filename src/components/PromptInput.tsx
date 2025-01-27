import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const PromptInput = ({ onSubmit, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
      <Input
        type="text"
        placeholder="Enter your music prompt (e.g., 'top hits of 2020')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="bg-spotify-darkgray text-white placeholder:text-spotify-lightgray border-none h-12"
      />
      <Button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-spotify-green hover:bg-spotify-green/90 text-white h-12"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Playlist"
        )}
      </Button>
    </form>
  );
};