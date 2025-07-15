/**
 * Base template for defaultFriendRow and inviteFriendRow components.
 */
import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { Profile } from '@/types';
import { useTripTheme } from '@/context/TripThemeProvider';

type Props = {
  item: Profile;
  onPress: () => void;
  RightAction: React.ReactNode;
};

export default function FriendRowBase({ item, onPress, RightAction }: Props) {
  const theme = useTripTheme();

  return (
    <View style={{ overflow: 'visible', position: 'relative' }}>
      <TouchableOpacity
        style={{
          backgroundColor: 'transparent',
          borderRadius: 16,
          paddingHorizontal: 1,
          paddingVertical: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
        onPress={onPress}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={{ uri: item.avatar_url }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
          />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text
            style={{
              color: theme.primaryText,
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            {item.name}
          </Text>
        </View>
        {RightAction}
      </TouchableOpacity>
    </View>
  );
}
