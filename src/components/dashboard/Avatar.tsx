import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  initials: string;
  size: number;
  /** Foto profil. Jika kosong / gagal dimuat → tampilkan inisial. */
  photoUri?: string;
}

export default function Avatar({ initials, size, photoUri }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photoUri]);

  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (photoUri && !failed) {
    return (
      <Image
        source={{ uri: photoUri }}
        style={[styles.circle, shape]}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={[styles.circle, shape]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.outfitBold, color: colors.primarySoft },
});
