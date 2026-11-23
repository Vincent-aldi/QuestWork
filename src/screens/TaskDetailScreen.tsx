import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/dashboard/Avatar';
import ChunkyButton from '../components/ChunkyButton';
import { colors, fonts, taskPalette } from '../theme/tokens';
import { fmtEn, getInitials } from '../utils/format';
import type { Task, TaskVariant } from '../types';

interface Props {
  task: Task;
  points: number;
  initials: string;
  photoUri?: string;
  onBack: () => void;
  onSubmit: (note: string) => void;
  onSoon: () => void;
}

const HEADER_H = 64;

const TAG: Record<TaskVariant, { bg: string; fg: string; shadow?: string }> = {
  weekly: { bg: taskPalette.weekly.btn, fg: taskPalette.weekly.btnText, shadow: taskPalette.weekly.btnShadow },
  monthly: { bg: taskPalette.monthly.btn, fg: taskPalette.monthly.btnText, shadow: taskPalette.monthly.btnShadow },
  daily: { bg: taskPalette.daily.tagBg, fg: taskPalette.daily.tagFg },
  personal: { bg: taskPalette.personal.tagBg, fg: taskPalette.personal.tagFg },
  learning: { bg: taskPalette.learning.tagBg, fg: taskPalette.learning.tagFg },
};

export default function TaskDetailScreen({ task, points, initials, photoUri, onBack, onSubmit, onSoon }: Props) {
  const insets = useSafeAreaInsets();
  const detail = task.detail;
  const checklist = detail?.checklist ?? [];

  const [checked, setChecked] = useState<boolean[]>(() => checklist.map(() => false));
  const [note, setNote] = useState('');

  // Tombol back Android kembali ke daftar tugas
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const allChecked = checked.every(Boolean);
  const total = task.progress?.total ?? 1;
  const nextDone = (task.progress?.done ?? 0) + 1;
  const completes = nextDone >= total;

  const [idLabel, ...restLabel] = task.code.split(' • ');
  const tag = TAG[task.variant];

  const toggle = (i: number) => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  // Bukti wajib diisi sebelum misi bisa diserahkan (langkah terakhir).
  const hasEvidence = note.trim().length > 0;
  const needsEvidence = completes && !hasEvidence;
  const canSubmit = allChecked && !needsEvidence;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(note.trim());
  };

  const hint = !allChecked
    ? 'Centang semua kriteria verifikasi untuk melanjutkan.'
    : needsEvidence
      ? 'Isi catatan atau tautan bukti pengerjaan dulu agar misi bisa diserahkan.'
      : !completes
      ? `Progres akan menjadi ${nextDone}/${total}. Imbalan diklaim saat progres penuh.`
      : null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_H + insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 16,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {/* Kategori & sisa waktu */}
        <View style={styles.rowBetween}>
          <View
            style={[
              styles.catPill,
              { backgroundColor: tag.bg },
              tag.shadow ? { borderBottomWidth: 2, borderBottomColor: tag.shadow } : null,
            ]}
          >
            <MaterialCommunityIcons
              name={task.variant === 'weekly' || task.variant === 'monthly' ? 'star-circle' : 'flag-variant'}
              size={13}
              color={tag.fg}
            />
            <Text style={[styles.catText, { color: tag.fg }]} numberOfLines={1}>
              {task.tag}
            </Text>
          </View>
          <View style={styles.timePill}>
            <View style={styles.dot} />
            <Text style={styles.timeText}>{task.meta}</Text>
          </View>
        </View>

        {/* Kartu judul */}
        <View style={styles.titleCard}>
          <View style={styles.rowBetween}>
            <View style={styles.idRow}>
              <View style={styles.idChip}>
                <Text style={styles.idText}>ID: {idLabel}</Text>
              </View>
              {restLabel.length > 0 && <Text style={styles.guild}>• {restLabel.join(' • ')}</Text>}
            </View>
            {detail?.priority ? <Text style={styles.priority}>{detail.priority}</Text> : null}
          </View>

          <Text style={styles.title}>{task.title}</Text>

          {detail?.creator && (
            <View style={styles.creatorRow}>
              <Avatar initials={getInitials(detail.creator.name)} size={36} />
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.creatorName}>{detail.creator.name}</Text>
                <Text style={styles.creatorRole}>{detail.creator.role}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Imbalan */}
        <View style={styles.rewardCard}>
          <View pointerEvents="none" style={styles.rewardGlow} />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.rewardLabel}>{'IMBALAN\nPENYELESAIAN'}</Text>
            <Text style={styles.rewardName}>{detail?.rewardName ?? 'Poin & EXP'}</Text>
          </View>
          <View style={styles.rewardBadges}>
            <View style={[styles.badge, { borderBottomColor: '#472a00' }]}>
              <Text style={styles.badgeEmoji}>⭐</Text>
              <Text style={[styles.badgeText, { color: colors.gold }]}>{`+${task.points}\nPoin`}</Text>
            </View>
            <View style={[styles.badge, { borderBottomColor: '#003824' }]}>
              <Ionicons name="flash" size={13} color={colors.green} />
              <Text style={[styles.badgeText, { color: colors.green }]}>{`+${task.exp ?? task.points}\nEXP`}</Text>
            </View>
          </View>
        </View>

        {/* Progres (hanya tugas bertahap) */}
        {task.progress && (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.progressLabel}>Progres saat ini</Text>
              <Text style={styles.progressValue}>
                {task.progress.done} / {task.progress.total}
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={{
                  width: `${(task.progress.done / task.progress.total) * 100}%`,
                  height: '100%',
                  borderRadius: 9999,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>
        )}

        {/* Deskripsi & kriteria */}
        {(detail?.description || checklist.length > 0) && (
          <View style={styles.card}>
            <View style={styles.headingRow}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={17} color={colors.gold} />
              <Text style={styles.heading}>Deskripsi & Panduan Kerja</Text>
            </View>

            {detail?.description ? <Text style={styles.desc}>{detail.description}</Text> : null}

            {checklist.length > 0 && (
              <View style={{ gap: 4, paddingTop: 4 }}>
                <Text style={styles.checkTitle}>KRITERIA VERIFIKASI ADMIN</Text>
                {checklist.map((item, i) => {
                  const on = checked[i];
                  return (
                    <Pressable
                      key={`${i}-${item}`}
                      onPress={() => toggle(i)}
                      style={[styles.checkRow, { backgroundColor: on ? colors.surface : colors.surfaceHighest }]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                    >
                      <View style={[styles.box, on ? styles.boxOn : styles.boxOff]}>
                        {on && <Ionicons name="checkmark" size={14} color="#003824" />}
                      </View>
                      <Text
                        style={[
                          styles.checkText,
                          on ? { textDecorationLine: 'line-through', opacity: 0.8 } : { fontFamily: fonts.jakartaBold },
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Catatan & bukti */}
        <View style={styles.card}>
          <View style={styles.headingRow}>
            <MaterialCommunityIcons name="link-variant" size={17} color={colors.gold} />
            <Text style={styles.heading}>Catatan Penyelesaian & Tautan Bukti</Text>
          </View>
          <Text style={styles.hintSmall}>Sertakan catatan, link file, atau URL bukti pengerjaan (wajib diisi untuk menyerahkan misi).</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="https://..."
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.primarySoft}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <View style={styles.rowBetween}>
            <Pressable onPress={onSoon} style={styles.uploadBtn} accessibilityRole="button">
              <Ionicons name="attach" size={16} color={colors.text} />
              <Text style={styles.uploadText}>Unggah File</Text>
            </Pressable>
            <Text style={styles.noFile}>Belum ada file terlampir</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={{ paddingTop: 4, gap: 8 }}>
          <ChunkyButton
            label={completes ? 'Serahkan Misi & Selesaikan' : `Catat Progres (${nextDone}/${total})`}
            icon={
              <MaterialCommunityIcons
                name={completes ? 'trophy-outline' : 'progress-check'}
                size={18}
                color={canSubmit ? colors.onPrimary : colors.textSubtle}
              />
            }
            color={canSubmit ? colors.primary : colors.outline}
            shadow={canSubmit ? colors.primaryShadow : colors.surface}
            textColor={canSubmit ? colors.onPrimary : colors.textSubtle}
            depth={4}
            radius={8}
            paddingV={14}
            disabled={!canSubmit}
            onPress={submit}
          />
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
      </ScrollView>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Kembali">
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </Pressable>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="sword-cross" size={17} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Quest Detail</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.pointsPill}>
              <Text style={styles.emoji}>⭐</Text>
              <Text style={styles.pointsText}>{fmtEn(points)}</Text>
            </View>
            <View style={styles.avatarRing}>
              <Avatar initials={initials} photoUri={photoUri} size={32} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },

  catPill: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  catText: { flexShrink: 1, fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.surfaceHighest,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  timeText: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48, color: colors.primarySoft },

  titleCard: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  idChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(108,92,231,0.2)',
  },
  idText: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48, color: colors.primarySoft },
  guild: { flexShrink: 1, fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  priority: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48, color: colors.green },
  title: { fontFamily: fonts.outfitBold, fontSize: 22, lineHeight: 28, letterSpacing: -0.22, color: colors.text },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  creatorName: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 20, color: colors.text },
  creatorRole: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 15, color: colors.textMuted },

  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHighest,
  },
  rewardGlow: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(238,152,0,0.18)',
  },
  rewardLabel: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: colors.gold,
  },
  rewardName: { fontFamily: fonts.outfitBold, fontSize: 20, lineHeight: 26, color: colors.text },
  rewardBadges: { flexDirection: 'row', gap: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    borderBottomWidth: 2,
  },
  badgeEmoji: { fontSize: 13 },
  badgeText: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18 },

  card: { gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.surfaceHigh },
  progressLabel: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  progressValue: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18, color: colors.text },
  track: { height: 8, borderRadius: 9999, backgroundColor: colors.inputBg, overflow: 'hidden' },

  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heading: { flexShrink: 1, fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
  desc: { fontFamily: fonts.jakartaRegular, fontSize: 14, lineHeight: 22.75, color: colors.textMuted },
  checkTitle: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 6, borderRadius: 8 },
  box: { width: 20, height: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  boxOn: { backgroundColor: colors.green },
  boxOff: { backgroundColor: colors.inputBg },
  checkText: { flex: 1, fontFamily: fonts.jakartaRegular, fontSize: 14, lineHeight: 20, color: colors.text },

  hintSmall: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  input: {
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighest,
  },
  uploadText: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48, color: colors.text },
  noFile: { flexShrink: 1, fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textSubtle },
  hint: { textAlign: 'center', fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(11,19,38,0.96)',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerRow: {
    height: HEADER_H,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest,
    borderBottomWidth: 2,
    borderBottomColor: colors.surface,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.amber,
    borderBottomWidth: 2,
    borderBottomColor: '#653e00',
  },
  emoji: { fontSize: 12 },
  pointsText: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18, color: '#5b3800' },
  avatarRing: { borderRadius: 9999, borderWidth: 2, borderColor: colors.primary },
});
