export default async function uploadOrb({
  uri,
  tripId,
  userId,
  vibecheckId,
  token,
}: {
  uri: string;
  tripId: string;
  userId: string;
  vibecheckId?: string | null;
  token: string;
}) {
  const formData = new FormData();
  formData.append('video', {
    uri,
    name: 'orb.mp4',
    type: 'video/mp4',
  } as unknown as Blob);

  formData.append('tripId', tripId);
  formData.append('userId', userId);
  if (vibecheckId) {
    formData.append('vibecheckId', vibecheckId);
  }

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/orbs/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const text = await res.text();
  console.log('[uploadOrb] Raw response:', text);
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error('Server did not return JSON');
  }

  if (!res.ok) {
    throw new Error(result.error || 'Upload failed');
  }

  return result;
}
