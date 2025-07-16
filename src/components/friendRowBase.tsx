/** **
 * Base template for defaultFriendRow and inviteFriendRow components.
 */
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import type { Profile } from '@/types';
import { useTripTheme } from '@/context/TripThemeProvider';

type Props = {
  item: Profile;
  onPress: () => void;
  RightAction: React.ReactNode;
  style?: ViewStyle;
};

export default function FriendRowBase({
  item,
  onPress,
  RightAction,
  style,
}: Props) {
  const theme = useTripTheme();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.touchable} onPress={onPress}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={{
              ...styles.name,
              color: theme.primaryText,
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

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
    position: 'relative',
  },
  touchable: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 1,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
});
