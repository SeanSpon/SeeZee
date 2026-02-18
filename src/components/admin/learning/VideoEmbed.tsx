"use client";

/**
 * VideoEmbed — Reusable component for embedding videos.
 * Detects YouTube URLs and renders an iframe; UploadThing URLs get an HTML5 video element.
 */

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=ID
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    // youtube.com/embed/ID
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/embed/")[1]?.split(/[?&]/)[0] || null;
    }
    // youtu.be/ID
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split(/[?&]/)[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function isUploadThingUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes("uploadthing") || u.hostname.includes("utfs.io");
  } catch {
    return false;
  }
}

interface VideoEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export default function VideoEmbed({ url, title = "Video", className = "" }: VideoEmbedProps) {
  const youtubeId = extractYouTubeId(url);

  if (youtubeId) {
    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (isUploadThingUrl(url)) {
    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
        <video
          src={url}
          controls
          className="absolute inset-0 w-full h-full object-contain"
          title={title}
        >
          Your browser does not support the video element.
        </video>
      </div>
    );
  }

  // Fallback: try as a generic video
  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
      <video
        src={url}
        controls
        className="absolute inset-0 w-full h-full object-contain"
        title={title}
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
}
