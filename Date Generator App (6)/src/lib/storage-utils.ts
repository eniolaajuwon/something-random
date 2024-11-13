import { supabase } from './supabase';

export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  try {
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`${userId}/${Date.now()}-${file.name}`, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
}