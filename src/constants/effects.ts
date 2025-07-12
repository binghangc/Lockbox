import { ImageSourcePropType } from 'react-native';
import bats from '../../assets/animations/bats.json';
import dazzle from '../../assets/animations/dazzle.json';
import festivelights from '../../assets/animations/festivelights.json';
import batsThumbnail from '../../assets/animations/thumbnails/bats.png';
import dazzleThumbnail from '../../assets/animations/thumbnails/dazzle.png';
import festivelightsThumbnail from '../../assets/animations/thumbnails/festive.png';

const effects: Record<
  string,
  {
    file: object;
    thumbnail: ImageSourcePropType;
    name: string;
  }
> = {
  bats: {
    file: bats,
    thumbnail: batsThumbnail,
    name: 'Bats',
  },
  dazzle: {
    file: dazzle,
    thumbnail: dazzleThumbnail,
    name: 'Dazzle',
  },
  festivelights: {
    file: festivelights,
    thumbnail: festivelightsThumbnail,
    name: 'Festive Lights',
  },
};

export default effects;
