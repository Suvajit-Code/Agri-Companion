# Media Upload Features - Implementation Guide

## Overview
Added comprehensive picture and video uploading capabilities to both the Community Forum and AI Chatbot sections of the Agri-Companion application.

## New Components Created

### 1. MediaUpload.tsx
**Location**: `src/components/MediaUpload.tsx`

A reusable component for uploading images and videos with the following features:
- **File Type Support**: Images and videos
- **Size Limit**: 10MB per file
- **Max Files**: Configurable (default: 5 files)
- **Preview Display**: Grid layout showing thumbnails
- **File Info**: Display file size on hover
- **Easy Removal**: Individual file deletion capability

**Key Features**:
- Drag-and-drop friendly file input
- Real-time preview of selected media
- File validation (type and size)
- Error messages for invalid uploads

### 2. MediaGallery.tsx
**Location**: `src/components/MediaGallery.tsx`

A display component for rendering uploaded media with features:
- **Responsive Grid**: Auto-adjusts for different screen sizes
- **Image Display**: Full-resolution image viewing
- **Video Support**: Embedded video player with controls
- **Optional Removal**: Admin/owner can remove media items
- **Clean UI**: Consistent styling with the app theme

## Features Added

### Community Forum Updates

**File**: `src/pages/Community.tsx`

#### Post Creation
- Added media upload in the "Create a Post" dialog
- Users can upload up to 5 images/videos per post
- Media files are stored alongside post content

#### Post Display
- **Card View**: Shows first 2 media items with "+X more" indicator
- **Detail View**: Full media gallery in post detail modal
- **Responsive**: Adapts to different screen sizes

#### Post Interface
```tsx
interface Post {
  // ... existing fields
  media?: MediaData[];  // NEW: Array of media files
}
```

### Chatbot Updates

**File**: `src/pages/Chatbot.tsx`

#### Message Attachment
- Users can upload up to 3 images/videos per message
- Media preview strip below input area
- Easy file removal with X button

#### Message Display
- Media appears above text in chat bubbles
- Separate visual handling for user vs assistant messages
- Full media gallery support for detailed viewing

#### Message Interface
```tsx
type Msg = {
  role: "user" | "assistant";
  content: string;
  media?: MediaData[];  // NEW: Optional media attachments
};
```

## Usage Examples

### In Community Forum
1. Click "New Post" button
2. Fill in title, category, content, and tags
3. Click "Add Media" button
4. Select images/videos from your device
5. View preview in the grid
6. Remove unwanted files by clicking the X button
7. Click "Publish Post" - media will be displayed

### In Chatbot
1. Type your farming question
2. Click "Add Media" button to attach pictures/videos
3. Media appears in the preview strip below
4. Send the message with attached media
5. Media displays in the chat thread

## Media Data Structure

```tsx
interface MediaData {
  id: string;           // Unique identifier
  url: string;          // Object URL or data URL
  type: "image" | "video"; // Media type
  name?: string;        // Original filename
}

interface MediaFile {
  id: string;           // Unique identifier
  file: File;           // Original File object
  preview: string;      // Object URL for preview
  type: "image" | "video"; // Media type
}
```

## Technical Details

### File Validation
- **Supported Types**: Any image/* or video/* MIME type
- **Max Size**: 10MB per file
- **Error Handling**: User-friendly error messages

### Storage
- Media is converted to object URLs for preview
- Data persists in component state (not yet persisted to database)
- Ready for Supabase storage integration

### Performance
- Lazy loading of previews
- Efficient grid rendering with React
- Minimal bundle size impact

## Integration with Supabase (Future)

The current implementation stores media as object URLs in component state. To persist media:

1. **Upload to Supabase Storage**:
   ```tsx
   const { data, error } = await supabase.storage
     .from('media')
     .upload(`posts/${postId}/${filename}`, file);
   ```

2. **Store Metadata in Database**:
   ```tsx
   await supabase
     .from('post_media')
     .insert({ post_id: postId, url: data.path, type: 'image' });
   ```

## Browser Compatibility
- Works with all modern browsers supporting:
  - File API
  - Blob URL API
  - HTML5 input[type="file"]

## Next Steps (Optional Enhancements)

1. **Database Integration**: Save media URLs to Supabase
2. **Compression**: Add image/video compression before upload
3. **Crop & Edit**: Allow users to crop/edit images before posting
4. **Drag & Drop**: Enhanced drag-and-drop upload support
5. **Progress Indicator**: Show upload progress for large files
6. **Thumbnail Generation**: Auto-generate thumbnails for performance

---

**Implementation Date**: April 2, 2026
**Build Status**: ✅ Successfully compiled and tested
