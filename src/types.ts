export type Role = 'host' | 'participant';
export type TripStatus = 'upcoming' | 'ongoing' | 'past' | 'pinned';

export type Trip = {
    id: string;
    title: string;
    description: string;
    country: string;
    thumbnail_url: string;
    status: TripStatus;

    created_at: string;
    start_date: string;
    end_date: string;

    user_id: string;
    host: Profile;
    participants: { profile: Profile; role: Role}[];
}


export type Invite = {
    id: string;
    trip_id: string;
    user_id: string;
    host_id: string;
    status: 'pending' | 'accepted' | 'declined';
    created_at: string;
    trip: Trip;
}

export type Profile = {
    id: string;
    username: string;
    name: string;
    bio?: string;
    avatar_url?: string;
  };
  
export type FriendRequest = {
    id: string;
    uid1: string;
    uid2: string;
    status: "pending" | "accepted" | "rejected";
    sender: Profile;
};