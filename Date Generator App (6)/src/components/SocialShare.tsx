import { Button } from "@/components/ui/button";
import { Link2 } from 'lucide-react';
import type { DateItinerary } from '@/types';

interface Props {
  dateItinerary: DateItinerary;
}

export function SocialShare({ dateItinerary }: Props) {
  const shareUrl = window.location.href;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={copyToClipboard}
      className="hover:bg-purple-50 hover:text-purple-600"
    >
      <Link2 className="h-4 w-4" />
    </Button>
  );
}