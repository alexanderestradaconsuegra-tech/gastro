import { supabase } from "./supabase";

export async function uploadMenuImage(file: File, itemId: string): Promise<string | null> {
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${itemId}.${ext}`;

  const { error } = await supabase.storage
    .from("menu-images")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) { console.error("uploadMenuImage:", error); return null; }

  const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadStaffAvatar(file: File, staffId: string): Promise<string | null> {
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${staffId}.${ext}`;

  const { error } = await supabase.storage
    .from("staff-avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) { console.error("uploadStaffAvatar:", error); return null; }

  const { data } = supabase.storage.from("staff-avatars").getPublicUrl(path);
  return data.publicUrl;
}
