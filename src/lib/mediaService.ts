import { supabase } from "@/integrations/supabase/client";

export interface MediaData {
  id: string;
  url: string;
  type: "image" | "video";
  name?: string;
}

export async function uploadMediaToSupabase(files: File[], userId: string, postId: string) {
  const uploadedMedia: { url: string; type: "image" | "video"; name: string }[] = [];

  for (const file of files) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${postId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `community/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const mediaType = file.type.startsWith("image/") ? "image" : "video";

      uploadedMedia.push({
        url: urlData.publicUrl,
        type: mediaType,
        name: fileName,
      });

      // Save media metadata to database
      await saveMediaMetadata(postId, urlData.publicUrl, mediaType, fileName);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
    }
  }

  return uploadedMedia;
}

export async function saveMediaMetadata(
  postId: string,
  mediaUrl: string,
  mediaType: "image" | "video",
  fileName: string
) {
  try {
    const sb = supabase as any;
    const { error } = await sb.from("community_post_media").insert([
      {
        post_id: postId,
        media_url: mediaUrl,
        media_type: mediaType,
        file_name: fileName,
      },
    ]);

    if (error) {
      console.warn("Note: community_post_media table not yet created. Create it in Supabase.", error);
    }
    return true;
  } catch (error) {
    console.error("Failed to save media metadata:", error);
    return false;
  }
}

export async function getPostMedia(postId: string): Promise<MediaData[]> {
  try {
    const sb = supabase as any;
    const { data, error } = await sb
      .from("community_post_media")
      .select("id, media_url, media_type, file_name")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Note: community_post_media table not yet created. Create it in Supabase.");
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      url: m.media_url,
      type: m.media_type,
      name: m.file_name,
    }));
  } catch (error) {
    console.error("Failed to get post media:", error);
    return [];
  }
}

export async function deletePostMedia(postId: string) {
  try {
    const sb = supabase as any;
    
    // Get all media for this post
    const { data: mediaFiles, error: fetchError } = await sb
      .from("community_post_media")
      .select("file_name, media_url")
      .eq("post_id", postId);

    if (fetchError) {
      console.warn("Note: community_post_media table not yet created.");
      return false;
    }

    // Delete files from storage
    if (mediaFiles && mediaFiles.length > 0) {
      const filePaths = mediaFiles.map((m: any) => {
        // Extract path from full URL
        const urlParts = m.media_url.split("/storage/v1/object/public/media/");
        return urlParts[1] || m.file_name;
      });

      await supabase.storage.from("media").remove(filePaths);
    }

    // Delete metadata records
    const { error: deleteError } = await sb
      .from("community_post_media")
      .delete()
      .eq("post_id", postId);

    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error("Failed to delete post media:", error);
    return false;
  }
}

export function saveMediaToStorage(
  postId: string,
  media: { url: string; type: "image" | "video"; name: string }[]
) {
  // This function is no longer needed with database storage
  // Keeping it for backwards compatibility
  return true;
}


