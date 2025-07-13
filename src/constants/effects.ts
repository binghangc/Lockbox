import { ImageSourcePropType } from 'react-native';
import bats from '../../assets/animations/bats.json';
import dazzle from '../../assets/animations/dazzle.json';
import festivelights from '../../assets/animations/festivelights.json';
import sakura from '../../assets/animations/sakura.json';
import grad from '../../assets/animations/grad.json';
import batsThumbnail from '../../assets/animations/thumbnails/bats.png';
import dazzleThumbnail from '../../assets/animations/thumbnails/dazzle.png';
import festivelightsThumbnail from '../../assets/animations/thumbnails/festive.png';
import sakuraThumbnail from '../../assets/animations/thumbnails/sakura.png';
import gradThumbnail from '../../assets/animations/thumbnails/grad.png';

const effects: Record<
  string,
  {
    file: object | null;
    thumbnail: ImageSourcePropType | null;
    name: string;
  }
> = {
  none: {
    file: null,
    thumbnail: null,
    name: 'None',
  },
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
  sakura: {
    file: sakura,
    thumbnail: sakuraThumbnail,
    name: 'Sakura',
  },
  grad: {
    file: grad,
    thumbnail: gradThumbnail,
    name: 'Grad',
  },
};

export default effects;
