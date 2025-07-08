import moonlightMobile from '../../assets/videos/moonlightMobile.mp4';
import grassMobile from '../../assets/videos/grassMobile.mp4';
import poolMobile from '../../assets/videos/poolMobile.mp4';
import rainbowMobile from '../../assets/videos/rainbowMobile.mp4';
import skiMobile from '../../assets/videos/skiMobile.mp4';

const videoBackgrounds: Record<
  string,
  { uri: string; mode: 'light' | 'dark' }
> = {
  'moonlightMobile.mp4': { uri: moonlightMobile, mode: 'dark' },
  'grassMobile.mp4': { uri: grassMobile, mode: 'light' },
  'poolMobile.mp4': { uri: poolMobile, mode: 'light' },
  'rainbowMobile.mp4': { uri: rainbowMobile, mode: 'light' },
  'skiMobile.mp4': { uri: skiMobile, mode: 'light' },
};

export default videoBackgrounds;
