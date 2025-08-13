import React from 'react';
import { TouchableOpacity, View, Animated } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTripTheme } from '@/context/TripThemeProvider';
import CircularPlaybackArc from '@/components/vault/circularPlaybackArc';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export interface OrbVideoBubbleProps {
  hlsUrl: string;
  size?: number;
}

export default function OrbVideoBubble({
  hlsUrl,
  size = 200,
}: OrbVideoBubbleProps) {
  const theme = useTripTheme();
  const [progress, setProgress] = React.useState(0);

  const [ended, setEnded] = React.useState(false);
  const [showPause, setShowPause] = React.useState(false);
  const [showPlay, setShowPlay] = React.useState(false);
  const playOpacity = React.useRef(new Animated.Value(0)).current;

  const triggerPlayOverlay = React.useCallback(() => {
    setShowPlay(true);
    playOpacity.setValue(1);
    Animated.timing(playOpacity, {
      toValue: 0,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setShowPlay(false);
    });
  }, [playOpacity]);

  const player = useVideoPlayer(hlsUrl, () => {
    // Video player initialized
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (player && player.duration > 0) {
        const ratio = player.currentTime / player.duration;
        setProgress(ratio);
        // Keep pause icon visible only when paused (not ended)
        if (!player.playing && ratio < 0.999) {
          setShowPause(true);
        } else if (player.playing) {
          setShowPause(false);
        }
        if (ratio >= 0.999) {
          setEnded(true);
          setShowPause(false);
        } else if (ended) {
          setEnded(false);
        }
      } else {
        setProgress(0);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [player, ended]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (!player) return;
        if (ended) {
          // Replay from start and show a brief play indicator
          if (typeof player.replay === 'function') {
            player.replay();
          } else {
            try {
              player.currentTime = 0;
              // eslint-disable-next-line no-empty
            } catch {}
          }
          setEnded(false);
          setShowPause(false);
          player.play();
          triggerPlayOverlay();
          return;
        }
        if (player.playing) {
          player.pause();
          setShowPause(true); // pause icon persists while paused
        } else {
          player.play();
          setShowPause(false);
          triggerPlayOverlay();
        }
      }}
      activeOpacity={0.9}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: theme.secondaryBackground,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          allowsPictureInPicture={false}
          allowsFullscreen={false}
          nativeControls={false}
          contentFit="cover"
        />
        <CircularPlaybackArc
          size={size}
          thickness={4}
          color="rgba(255,255,255,0.85)"
          progress={progress}
        />
        {/* Overlay Icons */}
        {showPause && !ended && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FontAwesome6
              name="pause"
              size={Math.max(24, Math.floor(size * 0.25))}
              color="white"
            />
          </View>
        )}
        {showPlay && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: playOpacity,
            }}
          >
            <FontAwesome6
              name="play"
              size={Math.max(24, Math.floor(size * 0.18))}
              color="white"
            />
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
}
