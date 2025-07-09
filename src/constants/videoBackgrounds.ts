import moonlightMobile from '../../assets/videos/moonlightMobile.mp4';
import grassMobile from '../../assets/videos/grassMobile.mp4';
import poolMobile from '../../assets/videos/poolMobile.mp4';
import rainbowMobile from '../../assets/videos/rainbowMobile.mp4';
import skiMobile from '../../assets/videos/skiMobile.mp4';

const videoBackgrounds: Record<
  string,
  { uri: string; mode: 'light' | 'dark' }
> = {
  moonlight: { uri: moonlightMobile, mode: 'dark' },
  grass: { uri: grassMobile, mode: 'light' },
  pool: { uri: poolMobile, mode: 'light' },
  rainbow: { uri: rainbowMobile, mode: 'light' },
  ski: { uri: skiMobile, mode: 'light' },
};

export default videoBackgrounds;
