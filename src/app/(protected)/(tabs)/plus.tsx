import { Redirect } from 'expo-router';

export default function PlusScreen() {
  return <Redirect href="/tripForm?mode=create" />;
}
