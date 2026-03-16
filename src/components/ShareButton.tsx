import { useState } from "react";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareButtonProps {
  /** If published, we share the public link */
  artifactId?: string | null;
  /** Fallback URL for resources (e.g. the original resource URL) */
  fallbackUrl?: string;
  title: string;
}

const ShareButton = ({ artifactId, fallbackUrl, title }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = artifactId
    ? `${window.location.origin}/shared/${artifactId}`
    : fallbackUrl || null;

  const handleNativeShare = async () => {
    if (!shareUrl) {
      toast({ title: "Publish first to share a link." });
      return;
    }
    try {
      await navigator.share({ title, url: shareUrl });
      setOpen(false);
    } catch {
      // User cancelled or not supported — fall through
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      toast({ title: "Publish first to share a link." });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: "Link copied!" });
    setOpen(false);
  };

  const handleTwitter = () => {
    if (!shareUrl) {
      toast({ title: "Publish first to share a link." });
      return;
    }
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
    setOpen(false);
  };

  const handleLinkedIn = () => {
    if (!shareUrl) {
      toast({ title: "Publish first to share a link." });
      return;
    }
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
    setOpen(false);
  };

  // On mobile with Web Share API, use native share directly
  if (typeof navigator !== "undefined" && navigator.share) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNativeShare();
        }}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label="Share"
      >
        <Share2 size={13} />
        Share
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Share"
        >
          <Share2 size={13} />
          Share
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-1.5"
        align="start"
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-2 text-left rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy link"}
        </button>
        <button
          onClick={handleTwitter}
          className="w-full flex items-center gap-2 text-left rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
        >
          <ExternalLink size={14} />
          Share on X
        </button>
        <button
          onClick={handleLinkedIn}
          className="w-full flex items-center gap-2 text-left rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
        >
          <ExternalLink size={14} />
          Share on LinkedIn
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;
