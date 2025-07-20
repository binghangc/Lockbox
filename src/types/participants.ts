import { Profile } from '@/types';

export interface ParticipantRow {
  user_id: string;
  profile: Profile;
  role?: string;
}
