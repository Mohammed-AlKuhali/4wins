import {
  useFonts,
  Fraunces_300Light,
  Fraunces_400Regular,
} from '@expo-google-fonts/fraunces';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexMono_400Regular,
} from '@expo-google-fonts/ibm-plex-mono';

export function useAppFonts() {
  return useFonts({
    Fraunces: Fraunces_300Light,
    Fraunces_300Light,
    Fraunces_400Regular,
    IBMPlexSans: IBMPlexSans_400Regular,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexMono: IBMPlexMono_400Regular,
    IBMPlexMono_400Regular,
  });
}

export const FONT_FAMILY = {
  fraunces: 'Fraunces',
  frauncesLight: 'Fraunces_300Light',
  frauncesRegular: 'Fraunces_400Regular',
  plexSans: 'IBMPlexSans_400Regular',
  plexSansMedium: 'IBMPlexSans_500Medium',
  plexMono: 'IBMPlexMono_400Regular',
} as const;
