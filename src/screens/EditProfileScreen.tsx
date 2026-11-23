import React, { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../components/dashboard/Avatar';
import ChunkyButton from '../components/ChunkyButton';
import IconTextField from '../components/IconTextField';
import { colors, fonts } from '../theme/tokens';
import { getInitials } from '../utils/format';
import type { Player } from '../types';

interface Props {
  player: Player;
  onCancel: () => void;
  onSave: (data: { name: string; role: string; photoUri?: string }) => void;
}

const NAME_MAX = 40;
const ROLE_MAX = 40;

export default function EditProfileScreen({ player, onCancel, onSave }: Props) {
  const roleRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [name, setName] = useState(player.name);
  const [role, setRole] = useState(player.role);
  const [photoUri, setPhotoUri] = useState<string | undefined>(player.photoUri);
  const [picking, setPicking] = useState(false);
  const [touched, setTouched] = useState(false);

  const cleanName = name.trim();
  const cleanRole = role.trim();
  const dirty = cleanName !== player.name || cleanRole !== player.role || photoUri !== player.photoUri;
  const nameError = cleanName.length < 2 ? 'Nama minimal 2 karakter.' : null;
  const canSave = dirty && !nameError;

  const requestClose = () => {
    if (!dirty) return onCancel();
    Alert.alert('Buang perubahan?', 'Perubahan yang belum disimpan akan hilang.', [
      { text: 'Lanjut edit', style: 'cancel' },
      { text: 'Buang', style: 'destructive', onPress: onCancel },
    ]);
  };

  // Tombol back Android menutup form (bukan keluar dari aplikasi)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      requestClose();
      return true;
    });
    return () => sub.remove();
  });

  /** Buka galeri. Jika dibatalkan, foto yang sekarang tetap dipakai. */
  const pickPhoto = async () => {
    if (picking) return;
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, // pengguna bisa memotong
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled) return;
      const uri = result.assets[0]?.uri;
      if (uri) setPhotoUri(uri);
    } catch {
      Alert.alert('Gagal memilih foto', 'Coba lagi sebentar lagi ya, Petualang.');
    } finally {
      setPicking(false);
    }
  };

  const submit = () => {
    setTouched(true);
    if (!canSave) return;
    onSave({ name: cleanName, role: cleanRole, photoUri });
  };

  return (
    <View style={{ gap: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={requestClose}
          hitSlop={8}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Edit Profil</Text>
        <View style={styles.back} />
      </View>

      {/* Preview avatar: foto pilihan, atau inisial otomatis dari nama */}
      <View style={styles.preview}>
        <View style={styles.avatarGlow}>
          <Avatar initials={getInitials(cleanName)} photoUri={photoUri} size={88} />
        </View>
        <View style={styles.photoActions}>
          <Pressable
            onPress={pickPhoto}
            disabled={picking}
            style={[styles.photoBtn, picking && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel={photoUri ? 'Ganti foto profil' : 'Pilih foto profil'}
          >
            <MaterialCommunityIcons name="image-edit-outline" size={16} color={colors.primarySoft} />
            <Text style={styles.photoBtnText}>{photoUri ? 'Ganti foto' : 'Pilih foto'}</Text>
          </Pressable>
          {photoUri ? (
            <Pressable
              onPress={() => setPhotoUri(undefined)}
              style={styles.photoBtn}
              accessibilityRole="button"
              accessibilityLabel="Hapus foto profil"
            >
              <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.danger} />
              <Text style={[styles.photoBtnText, { color: colors.danger }]}>Hapus</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.previewHint}>
          {photoUri ? 'Foto tersimpan setelah kamu menekan Simpan Perubahan.' : 'Tanpa foto, avatar memakai inisial dari nama.'}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <View style={{ gap: 4 }}>
          <IconTextField
            label="NAMA LENGKAP"
            hint={<Text style={styles.counter}>{name.length}/{NAME_MAX}</Text>}
            leftIcon={<MaterialCommunityIcons name="account-outline" size={17} color={colors.textSubtle} />}
            placeholder="misal: Citra Pratama"
            value={name}
            onChangeText={setName}
            maxLength={NAME_MAX}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => roleRef.current?.focus()}
            onBlur={() => setTouched(true)}
          />
          {touched && nameError ? <Text style={styles.error}>{nameError}</Text> : null}
        </View>

        <IconTextField
          ref={roleRef}
          label="JABATAN"
          hint={<Text style={styles.counter}>{role.length}/{ROLE_MAX}</Text>}
          leftIcon={<MaterialCommunityIcons name="briefcase-outline" size={16} color={colors.textSubtle} />}
          placeholder="misal: Senior Product Designer"
          value={role}
          onChangeText={setRole}
          maxLength={ROLE_MAX}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      {/* Aksi */}
      <View style={{ gap: 12 }}>
        <ChunkyButton
          label="Simpan Perubahan"
          icon={<Ionicons name="checkmark-circle-outline" size={17} color={canSave ? colors.onPrimary : colors.textSubtle} />}
          color={canSave ? colors.primary : colors.outline}
          shadow={canSave ? colors.primaryShadow : colors.surface}
          textColor={canSave ? colors.onPrimary : colors.textSubtle}
          depth={5}
          radius={12}
          paddingV={12}
          onPress={submit}
        />
        <Pressable onPress={requestClose} style={styles.cancel} accessibilityRole="button">
          <Text style={styles.cancelText}>Batal</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.outfitBold, fontSize: 18, lineHeight: 24, color: colors.text },
  preview: {
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighest,
  },
  avatarGlow: {
    borderRadius: 44,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  photoActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  photoBtnText: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.primarySoft },
  previewHint: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  counter: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 16, color: colors.textSubtle },
  error: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.danger },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontFamily: fonts.outfitBold, fontSize: 14, color: colors.textMuted },
});
