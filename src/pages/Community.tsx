import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, MessageSquare, Search, Plus, X, Check, Copy,
  TrendingUp, Leaf, Bug, CloudSun, Tractor, HelpCircle, Filter,
  Heart, MessageCircle, Eye, Clock, LogIn, Edit2, Trash2, Share,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { MediaUpload, MediaFile } from "@/components/MediaUpload";
import { MediaGallery, MediaData } from "@/components/MediaGallery";
import { uploadMediaToSupabase, getPostMedia, deletePostMedia } from "@/lib/mediaService";

const categories = [
  { id: "all", label: "All Topics", icon: Users },
  { id: "crops", label: "Crop Tips", icon: Leaf },
  { id: "pests", label: "Pest & Disease", icon: Bug },
  { id: "weather", label: "Weather Talk", icon: CloudSun },
  { id: "equipment", label: "Equipment", icon: Tractor },
  { id: "market", label: "Market Trends", icon: TrendingUp },
  { id: "help", label: "Ask for Help", icon: HelpCircle },
];

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  created_at: string;
  likes_count: number;
  user_id: string;
  liked_by_user: boolean;
}

interface Post {
  id: string;
  user_id: string;
  author: string;
  avatar: string;
  location?: string;
  category: string;
  title: string;
  content: string;
  image?: string;
  media?: MediaData[];
  likes_count: number;
  comments: Comment[];
  views_count: number;
  created_at: string;
  tags: string[];
  liked_by_user: boolean;
  bookmarked_by_user: boolean;
}

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const sb = supabase as any;

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newPostMedia, setNewPostMedia] = useState<MediaFile[]>([]);

  // Edit post form
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");

  // Fetch posts from Supabase with comments and like status
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["communityPosts", user?.id],
    queryFn: async () => {
      const { data, error } = await sb
        .from("community_posts")
        .select("id, user_id, title, content, category, tags, likes_count, views_count, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!data) return [];

      // Fetch user full names
      const userIds = Array.from(new Set((data as Array<{ user_id: string }>).map((p) => p.user_id)));
      const { data: profilesData } = await sb
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map<string, string>(
        profilesData?.map((p: { user_id: string; full_name: string }) => [p.user_id, p.full_name]) || []
      );

      // Fetch comments for each post
      const postsWithComments: Post[] = await Promise.all(
        (
          data as Array<{
            id: string;
            user_id: string;
            title: string;
            content: string;
            category: string;
            tags: string[];
            likes_count: number;
            views_count: number;
            created_at: string;
          }>
        ).map(async (post) => {
          // Fetch comments
          const { data: commentsData } = await sb
            .from("community_comments")
            .select("id, user_id, content, likes_count, created_at")
            .eq("post_id", post.id)
            .order("created_at", { ascending: true });

          // Fetch comment authors
          let comments: Comment[] = [];
          if (commentsData && commentsData.length > 0) {
            const commentUserIds = Array.from(
              new Set(commentsData.map((c: { user_id: string }) => c.user_id))
            );
            const { data: commentProfiles } = await sb
              .from("profiles")
              .select("user_id, full_name")
              .in("user_id", commentUserIds);

            const commentProfileMap = new Map<string, string>(
              commentProfiles?.map((p: { user_id: string; full_name: string }) => [
                p.user_id,
                p.full_name,
              ]) || []
            );

            // Fetch comment likes by current user
            let commentLikeMap = new Map<string, boolean>();
            if (isAuthenticated && user) {
              const { data: commentLikes } = await sb
                .from("community_comment_likes")
                .select("comment_id")
                .eq("user_id", user.id)
                .in(
                  "comment_id",
                  commentsData.map((c: { id: string }) => c.id)
                );

              commentLikeMap = new Map(
                commentLikes?.map((cl: { comment_id: string }) => [cl.comment_id, true]) || []
              );
            }

            comments = commentsData.map(
              (comment: {
                id: string;
                user_id: string;
                content: string;
                likes_count: number;
                created_at: string;
              }) => ({
                id: comment.id,
                author: commentProfileMap.get(comment.user_id) || "Farmer",
                avatar: (commentProfileMap.get(comment.user_id) || "F")[0].toUpperCase(),
                content: comment.content,
                created_at: comment.created_at,
                likes_count: comment.likes_count || 0,
                user_id: comment.user_id,
                liked_by_user: !!commentLikeMap.get(comment.id),
              })
            );
          }

          // Check if current user liked this post
          let liked_by_user = false;
          if (isAuthenticated && user) {
            const { data: userLike } = await sb
              .from("community_post_likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .maybeSingle();

            liked_by_user = !!userLike;
          }

          const fullName = profileMap.get(post.user_id) || "Farmer";
          
          // Fetch media for this post from database
          const media = await getPostMedia(post.id);
          
          return {
            id: post.id,
            user_id: post.user_id,
            author: fullName,
            avatar: fullName[0].toUpperCase(),
            category: post.category,
            title: post.title,
            content: post.content,
            likes_count: post.likes_count || 0,
            comments,
            views_count: post.views_count || 0,
            created_at: post.created_at,
            tags: post.tags || [],
            liked_by_user,
            bookmarked_by_user: false,
            media: media && media.length > 0 ? media : undefined,
          };
        })
      );

      return postsWithComments;
    },
    enabled: true,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      mediaFiles?: File[];
    }) => {
      // Create the post first
      const { data: newPost, error: postError } = await sb.from("community_posts").insert([
        {
          user_id: user?.id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
        },
      ]).select().single();

      if (postError) throw postError;
      if (!newPost) throw new Error("Failed to create post");

      // Upload media files if provided
      if (data.mediaFiles && data.mediaFiles.length > 0) {
        await uploadMediaToSupabase(data.mediaFiles, user?.id || "", newPost.id);
      }

      return newPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      setNewTags("");
      setNewPostMedia([]);
      setShowCreateDialog(false);
      toast({ title: "Success", description: "Post published! Media is now visible to all users." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Increment view count
  const incrementViewMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await sb.rpc("increment_post_views", { post_id: postId });
      if (error) throw error;
    },
    onError: () => {
      // Silently fail - not critical
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) throw new Error("Post not found");

      if (post.liked_by_user) {
        await sb
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user?.id);
      } else {
        await sb
          .from("community_post_likes")
          .insert([{ post_id: postId, user_id: user?.id }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { postId: string; content: string }) => {
      const { error } = await sb.from("community_comments").insert([
        {
          post_id: data.postId,
          user_id: user?.id,
          content: data.content,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast({ title: "Success", description: "Comment added!" });
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: async (data: {
      postId: string;
      title: string;
      content: string;
      category: string;
      tags: string[];
    }) => {
      const { error } = await sb
        .from("community_posts")
        .update({
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
        })
        .eq("id", data.postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setShowEditDialog(false);
      setSelectedPost(null);
      toast({ title: "Success", description: "Post updated!" });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Delete media files first
      await deletePostMedia(postId);

      // Then delete the post
      const { error } = await sb
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setSelectedPost(null);
      toast({ title: "Success", description: "Post deleted!" });
    },
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const comment = selectedPost?.comments.find((c) => c.id === commentId);
      if (!comment) throw new Error("Comment not found");

      if (comment.liked_by_user) {
        await sb
          .from("community_comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user?.id);
      } else {
        await sb
          .from("community_comment_likes")
          .insert([{ comment_id: commentId, user_id: user?.id }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  const filteredPosts = posts
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .filter(
      (p) =>
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags &&
          p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === "popular") return (b.likes_count || 0) - (a.likes_count || 0);
      if (sortBy === "mostViewed") return (b.views_count || 0) - (a.views_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!newTitle.trim() || !newContent.trim() || !newCategory) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    createPostMutation.mutate({
      title: newTitle,
      content: newContent,
      category: newCategory,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      mediaFiles: newPostMedia.length > 0 ? newPostMedia.map(m => m.file) : undefined,
    });
  };

  const handleAddComment = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!newComment.trim() || !selectedPost) return;
    addCommentMutation.mutate({
      postId: selectedPost.id,
      content: newComment,
    });
  };

  const handleLike = (postId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    likePostMutation.mutate(postId);
  };

  const handleOpenPost = (post: Post) => {
    setSelectedPost(post);
    incrementViewMutation.mutate(post.id);
  };

  const handleOpenEdit = () => {
    if (!selectedPost) return;
    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content);
    setEditCategory(selectedPost.category);
    setEditTags(selectedPost.tags.join(", "));
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPost || !editTitle.trim() || !editContent.trim() || !editCategory) return;
    editPostMutation.mutate({
      postId: selectedPost.id,
      title: editTitle,
      content: editContent,
      category: editCategory,
      tags: editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  const handleDeletePost = () => {
    if (!selectedPost) return;
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(selectedPost.id);
    }
  };

  const handleSharePost = (post: Post) => {
    const message = `Check out this post: "${post.title}" on Agri Companion`;
    const url = `${window.location.origin}/community`;

    if (navigator.share) {
      navigator.share({ title: "Agri Companion", text: message, url });
    } else {
      const shareUrl = `${url}?post=${post.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2000);
      toast({ title: "Link copied", description: "Post link copied to clipboard!" });
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    likeCommentMutation.mutate(commentId);
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      crops: "bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400",
      pests: "bg-red-500/15 text-red-700 border-red-200 dark:text-red-400",
      weather: "bg-blue-500/15 text-blue-700 border-blue-200 dark:text-blue-400",
      equipment: "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400",
      market: "bg-violet-500/15 text-violet-700 border-violet-200 dark:text-violet-400",
      help: "bg-pink-500/15 text-pink-700 border-pink-200 dark:text-pink-400",
    };
    return map[cat] || "bg-gray-500/15 text-gray-700 border-gray-200";
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  // Suppress unused variable warning for useEffect
  void useEffect;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Community Forum</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAuthenticated
              ? "Connect, share, and learn from fellow farmers"
              : "Sign in to join the conversation"}
          </p>
        </div>
        {isAuthenticated ? (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-warm text-secondary-foreground border-0 hover:opacity-90 gap-2 h-10">
                <Plus className="w-4 h-4" /> New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Share Your Knowledge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Post Title</label>
                  <Input
                    placeholder="What's on your mind?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="border-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.id !== "all")
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Share your experience, tips, or ask a question..."
                    rows={5}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="border-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                  <Input
                    placeholder="e.g., wheat, organic, rabi"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="border-2"
                  />
                </div>
                {newPostMedia.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Selected Media ({newPostMedia.length})</label>
                    <div className="flex gap-2 flex-wrap">
                      {newPostMedia.map((m) => (
                        <div key={m.id} className="relative rounded-lg overflow-hidden bg-muted border border-border group w-16 h-16">
                          {m.type === "image" ? (
                            <img src={m.preview} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <span className="text-xs text-white">Video</span>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const updated = newPostMedia.filter((x) => x.id !== m.id);
                              setNewPostMedia(updated);
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <MediaUpload onMediaSelect={setNewPostMedia} selectedMedia={newPostMedia} maxFiles={5} />
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="w-full gradient-warm text-secondary-foreground border-0 h-10"
                >
                  {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            onClick={() => navigate("/auth")}
            className="gradient-warm text-secondary-foreground border-0 gap-2 h-10"
          >
            <LogIn className="w-4 h-4" /> Sign In to Post
          </Button>
        )}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts and tags..."
            className="pl-9 border-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 border-2">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Liked</SelectItem>
            <SelectItem value="mostViewed">Most Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-12 h-12 rounded-full gradient-hero animate-spin border-4 border-transparent border-t-primary mx-auto mb-3" />
            <p className="font-medium">Loading community posts...</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border-2 border-border rounded-xl p-6 hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer"
                onClick={() => handleOpenPost(post)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shrink-0">
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-sm text-foreground">{post.author}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {getTimeAgo(post.created_at)}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {post.content}
                    </p>
                    {post.media && post.media.length > 0 && (
                      <div className="mb-4 max-h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {post.media[0].type === "image" ? (
                          <img src={post.media[0].url} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-48 bg-black flex items-center justify-center">
                            <span className="text-white text-sm">Video attached</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <Badge className={`${getCategoryColor(post.category)} border`}>
                        {categories.find((c) => c.id === post.category)?.label}
                      </Badge>
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 text-muted-foreground">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-110 ${
                          post.liked_by_user ? "text-red-500" : "hover:text-red-500"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${post.liked_by_user ? "fill-current" : ""}`}
                        />
                        {post.likes_count}
                      </button>
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <MessageCircle className="w-4 h-4" /> {post.comments.length}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Eye className="w-4 h-4" /> {post.views_count}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No posts found</p>
            <p className="text-sm mt-2">
              {isAuthenticated
                ? "Be the first to post in this category!"
                : "Sign in to start posting and joining discussions"}
            </p>
          </div>
        )}
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-11 h-11 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shrink-0">
                      {selectedPost.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{selectedPost.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(selectedPost.created_at)}
                      </p>
                    </div>
                  </div>
                  {user?.id === selectedPost.user_id && (
                    <div className="flex gap-1">
                      <Button
                        onClick={handleOpenEdit}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleDeletePost}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <DialogTitle className="font-heading text-xl mt-4">
                  {selectedPost.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>

                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">Attached Media</h4>
                    <MediaGallery media={selectedPost.media} />
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getCategoryColor(selectedPost.category)} border`}>
                    {categories.find((c) => c.id === selectedPost.category)?.label}
                  </Badge>
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-muted-foreground border-y border-border py-4">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-all ${
                      selectedPost.liked_by_user ? "text-red-500" : "hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${selectedPost.liked_by_user ? "fill-current" : ""}`}
                    />
                    {selectedPost.likes_count} Likes
                  </button>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Eye className="w-4 h-4" /> {selectedPost.views_count} Views
                  </span>
                  <button
                    onClick={() => handleSharePost(selectedPost)}
                    className="flex items-center gap-2 text-sm font-medium hover:text-foreground ml-auto"
                  >
                    {copiedPostId === selectedPost.id ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Share className="w-4 h-4" /> Share
                      </>
                    )}
                  </button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h4 className="font-heading font-semibold text-base">
                    Comments ({selectedPost.comments.length})
                  </h4>

                  {isAuthenticated ? (
                    <div className="flex gap-3 bg-muted/30 rounded-lg p-4">
                      <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-xs shrink-0 mt-1">
                        {user?.email?.[0].toUpperCase() || "Y"}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          placeholder="Share your thoughts..."
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="border-2 resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              handleAddComment();
                            }
                          }}
                        />
                        <Button
                          onClick={handleAddComment}
                          disabled={addCommentMutation.isPending || !newComment.trim()}
                          className="self-end gradient-warm text-secondary-foreground border-0 h-10"
                        >
                          {addCommentMutation.isPending ? "..." : "Post"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">Sign in to comment</p>
                      <Button
                        onClick={() => navigate("/auth")}
                        className="gradient-warm text-secondary-foreground border-0 gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Sign In
                      </Button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-3 mt-6">
                    {selectedPost.comments.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-6">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      selectedPost.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 bg-muted/30 rounded-lg p-4">
                          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-heading font-bold text-xs shrink-0 mt-1">
                            {comment.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                              {comment.content}
                            </p>
                            {isAuthenticated && (
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className={`flex items-center gap-1 text-xs font-medium transition-all ${
                                  comment.liked_by_user
                                    ? "text-red-500"
                                    : "text-muted-foreground hover:text-red-500"
                                }`}
                              >
                                <Heart
                                  className={`w-3 h-3 ${comment.liked_by_user ? "fill-current" : ""}`}
                                />
                                {comment.likes_count}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.id !== "all")
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="border-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="border-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                disabled={editPostMutation.isPending}
                className="flex-1 gradient-warm text-secondary-foreground border-0"
              >
                {editPostMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => setShowEditDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}