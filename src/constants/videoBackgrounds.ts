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
  {
    uri: string;
    mode: 'light' | 'dark';
    thumbnail: ImageSourcePropType;
    primaryColor: string;
    secondaryColor: string;
  }
> = {
  moonlight: {
    uri: moonlightMobile,
    mode: 'dark',
    thumbnail: moonlightThumbnail,
    primaryColor: '#A5C4F3',
    secondaryColor: '#6666CC',
  },
  grass: {
    uri: grassMobile,
    mode: 'light',
    thumbnail: grassThumbnail,
    primaryColor: '#336600',
    secondaryColor: '#4F7A2F',
  },
  pool: {
    uri: poolMobile,
    mode: 'light',
    thumbnail: poolThumbnail,
    primaryColor: '#336699',
    secondaryColor: '#66CCFF',
  },
  rainbow: {
    uri: rainbowMobile,
    mode: 'light',
    thumbnail: rainbowThumbnail,
    primaryColor: '#9966CC',
    secondaryColor: '#996699',
  },
  ski: {
    uri: skiMobile,
    mode: 'light',
    thumbnail: skiThumbnail,
    primaryColor: '#C47AF3',
    secondaryColor: '#6B2F7A',
  },
};

export default videoBackgrounds;
