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
    surfaceColor: string;
  }
> = {
  moonlight: {
    uri: moonlightMobile,
    mode: 'dark',
    thumbnail: moonlightThumbnail,
    primaryColor: '#A5C4F3',
    secondaryColor: '#6666CC',
    surfaceColor: '#00081d',
  },
  grass: {
    uri: grassMobile,
    mode: 'light',
    thumbnail: grassThumbnail,
    primaryColor: '#336600',
    secondaryColor: '#4F7A2F',
    surfaceColor: '#e1ce71',
  },
  pool: {
    uri: poolMobile,
    mode: 'light',
    thumbnail: poolThumbnail,
    primaryColor: '#336699',
    secondaryColor: '#66CCFF',
    surfaceColor: '#bce4eb',
  },
  rainbow: {
    uri: rainbowMobile,
    mode: 'light',
    thumbnail: rainbowThumbnail,
    primaryColor: '#9966CC',
    secondaryColor: '#996699',
    surfaceColor: '#b6b4e1',
  },
  ski: {
    uri: skiMobile,
    mode: 'light',
    thumbnail: skiThumbnail,
    primaryColor: '#CC3300',
    secondaryColor: '#FF6633',
    surfaceColor: '#e2e3e4',
  },
};

export default videoBackgrounds;
