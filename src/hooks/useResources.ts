import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ResourceCategory = "inspiration" | "templates" | "tools" | "learning" | "other";

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: ResourceCategory;
  description: string | null;
  domain: string | null;
  cover_image_url: string | null;
  favicon_url: string | null;
  og_title: string | null;
  tags: string[];
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchResources = useCallback(async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setResources(data as Resource[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const fetchUrlMetadata = async (url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-url-metadata", {
        body: { url },
      });
      if (error || !data?.success) return null;
      return data as { domain: string; ogImage: string | null; ogTitle: string | null; faviconUrl: string };
    } catch {
      return null;
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user?.id) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("resource-files").upload(path, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from("resource-files").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const addResource = async (resource: {
    title: string;
    url: string;
    category: ResourceCategory;
    description?: string;
    tags?: string[];
    file?: File;
  }) => {
    // Normalize URL
    let normalizedUrl = resource.url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Parse domain client-side as fallback
    let domain: string;
    try {
      domain = new URL(normalizedUrl).hostname.replace("www.", "");
    } catch {
      domain = normalizedUrl;
    }

    // Upload file if provided
    let fileUrl: string | null = null;
    if (resource.file) {
      fileUrl = await uploadFile(resource.file);
    }

    // Optimistic insert with basic data
    const optimistic: Resource = {
      id: crypto.randomUUID(),
      title: resource.title,
      url: normalizedUrl,
      category: resource.category,
      description: resource.description || null,
      domain,
      cover_image_url: null,
      favicon_url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      og_title: null,
      tags: resource.tags || [],
      file_url: fileUrl,
      file_name: resource.file?.name || null,
      file_type: resource.file?.type || null,
      created_at: new Date().toISOString(),
    };
    setResources((prev) => [optimistic, ...prev]);

    // Fetch metadata in background
    const meta = await fetchUrlMetadata(normalizedUrl);

    const insertData = {
      title: resource.title,
      url: normalizedUrl,
      category: resource.category,
      description: resource.description || null,
      domain: meta?.domain || domain,
      cover_image_url: meta?.ogImage || null,
      favicon_url: meta?.faviconUrl || optimistic.favicon_url,
      og_title: meta?.ogTitle || null,
      tags: resource.tags || [],
      file_url: fileUrl,
      file_name: resource.file?.name || null,
      file_type: resource.file?.type || null,
      user_id: user?.id,
    };

    const { data, error } = await supabase
      .from("resources")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      setResources((prev) => prev.filter((r) => r.id !== optimistic.id));
      return null;
    }

    setResources((prev) =>
      prev.map((r) => (r.id === optimistic.id ? (data as Resource) : r))
    );
    return data as Resource;
  };

  const updateResource = async (
    id: string,
    updates: { title?: string; url?: string; category?: ResourceCategory; description?: string | null }
  ) => {
    const backup = resources;
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );

    const { data, error } = await supabase
      .from("resources")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setResources(backup);
      return null;
    }
    setResources((prev) =>
      prev.map((r) => (r.id === id ? (data as Resource) : r))
    );
    return data as Resource;
  };

  const deleteResource = async (id: string) => {
    const backup = resources;
    setResources((prev) => prev.filter((r) => r.id !== id));

    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) {
      setResources(backup);
      return false;
    }
    return true;
  };

  return { resources, loading, addResource, updateResource, deleteResource, refetch: fetchResources };
}
