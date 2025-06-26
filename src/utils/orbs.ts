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
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Upload failed');
  }

  return result;
}
