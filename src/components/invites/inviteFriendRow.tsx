import React from 'react';
import InviteFriendActionButton from '@/components/invites/inviteFriendActionButton';
import type { Profile } from '@/types';
import FriendRowBase from '@/components/friendRowBase';

type FriendRow = Profile & { friendshipId?: string };

type Props = {
  item: FriendRow;
  alreadyInvitedIds: string[];
  inviteStatus: Record<string, 'idle' | 'loading' | 'sent' | 'failed'>;
  onSelect: (item: FriendRow) => void;
};

export default function InviteFriendRow({
  item,
  alreadyInvitedIds,
  inviteStatus,
  onSelect,
}: Props) {
  const status =
    inviteStatus[item.id] ??
    (alreadyInvitedIds?.includes(item.id) ? 'sent' : undefined);

  const handlePress = () => {
    if (status === 'sent') return;
    onSelect(item);
  };

  return (
    <FriendRowBase
      item={item}
      onPress={() => onSelect(item)}
      RightAction={
        <InviteFriendActionButton
          status={status}
          disabled={status === 'sent' || alreadyInvitedIds.includes(item.id)}
          onPress={handlePress}
        />
      }
    />
  );
}
