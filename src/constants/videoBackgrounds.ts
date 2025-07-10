import { ImageSourcePropType } from 'react-native';
import moonlightMobile from '../../assets/videos/moonlightMobile.mp4';
import grassMobile from '../../assets/videos/grassMobile.mp4';
import poolMobile from '../../assets/videos/poolMobile.mp4';
import rainbowMobile from '../../assets/videos/rainbowMobile.mp4';
import skiMobile from '../../assets/videos/skiMobile.mp4';
import moonlightThumbnail from '../../assets/videos/thumbnails/moonlight.png';
import grassThumbnail from '../../assets/videos/thumbnails/grass.png';
import poolThumbnail from '../../assets/videos/thumbnails/pool.png';
import rainbowThumbnail from '../../assets/videos/thumbnails/rainbow.png';
import skiThumbnail from '../../assets/videos/thumbnails/ski.png';

const videoBackgrounds: Record<
  string,
  { uri: string; mode: 'light' | 'dark'; thumbnail: ImageSourcePropType }
> = {
  moonlight: {
    uri: moonlightMobile,
    mode: 'dark',
    thumbnail: moonlightThumbnail,
  },
  grass: {
    uri: grassMobile,
    mode: 'light',
    thumbnail: grassThumbnail,
  },
  pool: {
    uri: poolMobile,
    mode: 'light',
    thumbnail: poolThumbnail,
  },
  rainbow: {
    uri: rainbowMobile,
    mode: 'light',
    thumbnail: rainbowThumbnail,
  },
  ski: {
    uri: skiMobile,
    mode: 'light',
    thumbnail: skiThumbnail,
  },
};

export default videoBackgrounds;
