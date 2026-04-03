import { X } from "lucide-react";

export interface MediaData {
  id: string;
  url: string;
  type: "image" | "video";
  name?: string;
}

interface MediaGalleryProps {
  media: MediaData[];
  onRemove?: (id: string) => void;
}

export function MediaGallery({ media, onRemove }: MediaGalleryProps) {
  if (media.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {media.map((item) => (
        <div
          key={item.id}
          className="relative rounded-lg overflow-hidden bg-muted border border-border group"
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt={item.name || "Media"}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-black flex items-center justify-center">
              <video
                src={item.url}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Remove Button */}
          {onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
