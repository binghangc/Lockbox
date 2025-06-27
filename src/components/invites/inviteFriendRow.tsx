import React from 'react';
import InviteFriendActionButton from '@/components/invites/inviteFriendActionButton';
import type { Profile } from '@/types';
import FriendRowBase from '@/components/friendRowBase';

type FriendRow = Profile & { friendshipId?: string };

type Props = {
  item: FriendRow;
  alreadyInvitedIds: string[];
  inviteStatus: Record<
    string,
    'idle' | 'loading' | 'pending' | 'accepted' | 'declined' | 'failed'
  >;
  onSelect: (item: FriendRow) => void;
};

export default function InviteFriendRow({
  item,
  alreadyInvitedIds,
  inviteStatus,
  onSelect,
}: Props) {
  const status = inviteStatus[item.id] ?? 'idle';

  const isDisabled = ['pending', 'accepted', 'declined'].includes(status ?? '');

  const handlePress = () => {
    if (isDisabled) return;
    onSelect(item);
  };

  return (
    <FriendRowBase
      item={item}
      onPress={null}
      RightAction={
        <InviteFriendActionButton
          status={status}
          disabled={isDisabled}
          onPress={handlePress}
        />
      }
    />
  );
}
