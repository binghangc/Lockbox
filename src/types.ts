export type User = {
    id: string;
    username: string;
    avatar_url: string;
    bio: string;
}

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
    host: User;
    participants: { user: User; role: Role}[];
}



export type Invite = {
    id: string;
    trip_id: string;
    inviter: User;
    invitee: User;
    status: 'pending' | 'accepted' | 'declined';

    created_at: string;
    updated_at: string;
}