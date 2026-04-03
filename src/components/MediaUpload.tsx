import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Image, Video, Upload } from "lucide-react";

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
}

interface MediaUploadProps {
  onMediaSelect: (media: MediaFile[]) => void;
  selectedMedia: MediaFile[];
  maxFiles?: number;
}

export function MediaUpload({
  onMediaSelect,
  selectedMedia,
  maxFiles = 5,
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = Array.from(event.target.files || []);

    if (files.length + selectedMedia.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newMedia: MediaFile[] = [];
    for (const file of files) {
      // Validate file type
      if (
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/")
      ) {
        setError("Only images and videos are allowed");
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        continue;
      }

      const preview = URL.createObjectURL(file);
      const type = file.type.startsWith("image/") ? "image" : "video";
      const media: MediaFile = {
        id: Date.now() + Math.random().toString(),
        file,
        preview,
        type,
      };
      newMedia.push(media);
    }

    onMediaSelect([...selectedMedia, ...newMedia]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (id: string) => {
    const media = selectedMedia.find((m) => m.id === id);
    if (media) {
      URL.revokeObjectURL(media.preview);
    }
    onMediaSelect(selectedMedia.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full gap-2"
          disabled={selectedMedia.length >= maxFiles}
        >
          <Upload className="w-4 h-4" />
          Add Media ({selectedMedia.length}/{maxFiles})
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Media Preview */}
      {selectedMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {selectedMedia.map((media) => (
            <div
              key={media.id}
              className="relative rounded-lg overflow-hidden bg-muted border border-border group"
            >
              {media.type === "image" ? (
                <img
                  src={media.preview}
                  alt="preview"
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 bg-muted flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              {/* File Info */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {media.type === "image" ? (
                  <Image className="w-4 h-4 text-white" />
                ) : (
                  <Video className="w-4 h-4 text-white" />
                )}
                <span className="text-xs text-white font-medium">
                  {(media.file.size / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeMedia(media.id)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
