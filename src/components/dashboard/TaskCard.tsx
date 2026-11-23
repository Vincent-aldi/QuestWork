import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ChunkyButton from '../ChunkyButton';
import { colors, fonts, taskPalette } from '../../theme/tokens';
import type { Task, TaskVariant } from '../../types';

interface Props {
  task: Task;
  onOpen: (id: string) => void; // buka layar Detail Tugas
}

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Theme {
  cardBg: string;
  border: string;
  tagBg: string;
  tagColor: string;
  tagIcon: MCIName;
  iconBoxBg: string;
  iconBoxBorder?: string;
  mainIcon: MCIName;
  iconColor: string;
  codeColor: string;
  titleColor: string;
  progressFill: string;
  pillBg: string;
  btn: string;
  btnShadow: string;
  btnText: string;
}

const make = (v: TaskVariant, extra: Pick<Theme, 'tagIcon' | 'mainIcon' | 'codeColor' | 'titleColor'> & Partial<Theme>): Theme => {
  const p = taskPalette[v];
  return {
    cardBg: p.cardBg,
    border: p.border,
    tagBg: p.tagBg,
    tagColor: p.tagFg,
    iconBoxBg: p.iconBoxBg,
    iconColor: p.iconColor,
    progressFill: p.progress,
    pillBg: p.pillBg,
    btn: p.btn,
    btnShadow: p.btnShadow,
    btnText: p.btnText,
    ...extra,
  };
};

// weekly = teal • monthly = midnight keputihan • daily = biru • personal = ungu • learning = midnight
const THEMES: Record<TaskVariant, Theme> = {
  weekly: make('weekly', {
    tagIcon: 'calendar-week',
    mainIcon: 'medal',
    iconBoxBorder: taskPalette.weekly.border,
    codeColor: '#b7c8cc',
    titleColor: '#eafaf8',
  }),
  monthly: make('monthly', {
    tagIcon: 'calendar-month',
    mainIcon: 'trophy',
    iconBoxBorder: taskPalette.monthly.border,
    codeColor: '#bcc3dc',
    titleColor: '#f4f6ff',
  }),
  daily: make('daily', {
    tagIcon: 'calendar-check',
    mainIcon: 'monitor-dashboard',
    codeColor: colors.textMuted,
    titleColor: colors.text,
  }),
  personal: make('personal', {
    tagIcon: 'account-star',
    mainIcon: 'monitor-dashboard',
    codeColor: colors.textMuted,
    titleColor: colors.text,
  }),
  learning: make('learning', {
    tagIcon: 'school',
    mainIcon: 'school',
    iconBoxBorder: taskPalette.learning.border,
    codeColor: colors.textMuted,
    titleColor: colors.text,
  }),
};


export default function TaskCard({ task, onOpen }: Props) {
  const claimed = task.status === 'claimed';
  const th = THEMES[task.variant];
  // Mingguan & Bulanan memakai tata letak "unggulan" (kartu gradien, pil Poin + EXP, tombol gradien)
  const featured = task.variant === 'weekly' || task.variant === 'monthly';
  const fp = task.variant === 'monthly' ? taskPalette.monthly : taskPalette.weekly;
  const press = () => onOpen(task.id);

  /* ---------- kartu sudah diklaim ---------- */
  if (claimed) {
    return (
      <View style={[styles.card, styles.claimedCard, { backgroundColor: taskPalette.approved.cardBg, borderWidth: 1, borderColor: taskPalette.approved.border }]}>
        <View style={styles.rowBetween}>
          <View style={[styles.tag, { backgroundColor: taskPalette.approved.tagBg, paddingHorizontal: 10 }]}>
            <Ionicons name="checkmark-circle" size={13} color={colors.green} />
            <Text style={[styles.tagText, { color: colors.green }]}>Selesai ✓ - Poin Diklaim</Text>
          </View>
          <Text style={styles.meta}>{task.claimedAt ?? task.meta}</Text>
        </View>

        <View style={styles.mainRow}>
          <View style={[styles.iconBox, { backgroundColor: taskPalette.approved.iconBoxBg }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={colors.green} />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.code, { color: colors.textMuted }]}>{task.code}</Text>
            <Text style={[styles.title, styles.struck, { color: colors.text }]}>{task.title}</Text>
          </View>
        </View>

        <View style={[styles.footer, { paddingTop: 4 }]}>
          <View style={[styles.pill, { backgroundColor: taskPalette.approved.pillBg }]}>
            <Text style={styles.pillEmoji}>⭐</Text>
            <Text style={[styles.pillText, { color: colors.green }]}>+{task.points} Poin Diterima</Text>
          </View>
          <View style={styles.rowGap4}>
            <Ionicons name="checkmark-done" size={14} color={colors.green} />
            <Text style={styles.success}>Berhasil</Text>
          </View>
        </View>
      </View>
    );
  }

  /* ---------- kartu menunggu review (kuning) ---------- */
  if (task.pendingReview) {
    const rv = taskPalette.review;
    return (
      <View style={[styles.card, { backgroundColor: rv.cardBg, borderWidth: 1, borderColor: rv.border }]}>
        <View style={styles.rowBetween}>
          <View style={[styles.tag, { backgroundColor: rv.tagBg, paddingHorizontal: 10 }]}>
            <MaterialCommunityIcons name="clock-outline" size={13} color={rv.tagFg} />
            <Text style={[styles.tagText, { color: rv.tagFg }]}>Menunggu Review</Text>
          </View>
          <Text style={[styles.meta, { color: rv.tagFg }]}>{task.meta}</Text>
        </View>

        <View style={styles.mainRow}>
          <View style={[styles.iconBox, { backgroundColor: rv.iconBoxBg }]}>
            <MaterialCommunityIcons name="timer-sand" size={22} color={rv.iconColor} />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.code, { color: colors.textMuted }]}>{task.code}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
          </View>
        </View>

        {task.progress && <ProgressBox task={task} fill={rv.progress} />}

        <View style={[styles.footer, { paddingTop: 4 }]}>
          <View style={[styles.pill, { backgroundColor: rv.pillBg }]}>
            <Text style={styles.pillEmoji}>⭐</Text>
            <Text style={[styles.pillText, { color: colors.gold }]}>+{task.points} Poin</Text>
          </View>
          <ChunkyButton
            label="Menunggu Review"
            icon={<MaterialCommunityIcons name="clock-outline" size={15} color={rv.btnText} />}
            color={rv.btn}
            shadow={rv.btnShadow}
            textColor={rv.btnText}
            depth={2}
            paddingH={14}
            onPress={press}
          />
        </View>
      </View>
    );
  }

  /* ---------- kartu aktif ---------- */
  const cardInner = (
    <>
      <View style={styles.rowBetween}>
        <View style={[styles.tag, { backgroundColor: th.tagBg }]}>
          <MaterialCommunityIcons name={th.tagIcon} size={13} color={th.tagColor} />
          <Text style={[styles.tagText, { color: th.tagColor }]}>{task.tag}</Text>
        </View>
        {featured ? (
          <View style={styles.rowGap4}>
            <Ionicons name="time-outline" size={13} color="#aeb9cc" />
            <Text style={[styles.meta, { color: '#aeb9cc' }]}>{task.meta}</Text>
          </View>
        ) : (
          <Text style={styles.meta}>{task.meta}</Text>
        )}
      </View>

      <View style={styles.mainRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: th.iconBoxBg },
            th.iconBoxBorder ? { borderWidth: 0.75, borderColor: th.iconBoxBorder } : null,
          ]}
        >
          <MaterialCommunityIcons
            name={th.mainIcon}
            size={featured ? 22 : 20}
            color={th.iconColor}
          />
        </View>
        <View style={styles.flex1}>
          <Text style={[styles.code, { color: th.codeColor }]}>{task.code}</Text>
          <Text style={[styles.title, { color: th.titleColor }]}>{task.title}</Text>
        </View>
      </View>

      {task.progress && <ProgressBox task={task} fill={th.progressFill} />}

      <View style={[styles.footer, { paddingTop: 4 }]}>
        {featured ? (
          <View style={{ gap: 4, alignItems: 'center' }}>
            <View style={[styles.pill, { backgroundColor: th.pillBg }]}>
              <Text style={styles.pillEmoji}>⭐</Text>
              <Text style={[styles.pillText, { color: th.tagColor }]}>+{task.points} Poin</Text>
            </View>
            <View style={[styles.pill, { paddingVertical: 2 }]}>
              <Ionicons name="flash" size={11} color={colors.primarySoft} />
              <Text style={[styles.pillText, { color: colors.primarySoft }]}>+{task.exp ?? task.points} EXP</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.pill, { backgroundColor: th.pillBg }]}>
            <Text style={styles.pillEmoji}>⭐</Text>
            <Text style={[styles.pillText, { color: colors.gold }]}>+{task.points} Poin</Text>
          </View>
        )}

        {featured && (
          <ChunkyButton
            label="Centang Selesai"
            icon={<Ionicons name="checkmark-circle-outline" size={15} color={th.btnText} />}
            color={th.btn}
            shadow={th.btnShadow}
            textColor={th.btnText}
            depth={2}
            paddingH={14}
            style={{ width: 151 }}
            onPress={press}
            background={
              <LinearGradient
                colors={[...fp.btnGradient]}
                locations={[0.115, 0.408, 0.538, 0.885]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            }
          />
        )}
        {task.variant === 'daily' && (
          <ChunkyButton
            label="Centang Selesai"
            icon={<Ionicons name="checkmark-circle-outline" size={15} color={th.btnText} />}
            color={th.btn}
            shadow={th.btnShadow}
            textColor={th.btnText}
            onPress={press}
          />
        )}
        {task.variant === 'personal' && (
          <ChunkyButton
            label="Centang Selesai"
            icon={<Ionicons name="checkmark-circle-outline" size={15} color={th.btnText} />}
            color={th.btn}
            shadow={th.btnShadow}
            textColor={th.btnText}
            onPress={press}
          />
        )}
        {task.variant === 'learning' && (
          <ChunkyButton
            label="Lanjutkan"
            icon={<Ionicons name="play" size={11} color={th.btnText} />}
            color={th.btn}
            shadow={th.btnShadow}
            textColor={th.btnText}
            onPress={press}
          />
        )}
      </View>
    </>
  );

  if (featured) {
    return (
      <LinearGradient
        colors={[...fp.cardGradient]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.card, { borderWidth: 1, borderColor: th.border }]}
      >
        {cardInner}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: th.cardBg },
        { borderWidth: 1, borderColor: th.border },
      ]}
    >
      {cardInner}
    </View>
  );
}

function ProgressBox({ task, fill }: { task: Task; fill: string }) {
  const { done, total } = task.progress!;
  const pct = (done / total) * 100;
  const learning = task.variant === 'learning';
  const label = learning
    ? `Modul ${done} dari ${total} selesai`
    : task.variant === 'personal'
      ? 'Progres Personal'
      : 'Progres Milestone';
  const value = learning ? `${Math.round(pct)}%` : `${done} / ${total} Selesai`;

  return (
    <View style={styles.progressBox}>
      <View style={styles.rowBetween}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressValue, { color: learning ? colors.gold : colors.text }]}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, backgroundColor: fill }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  claimedCard: { gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowGap4: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flex1: { flex: 1 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  tagText: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
  meta: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  mainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  code: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18 },
  title: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22 },
  struck: { textDecorationLine: 'line-through', opacity: 0.75 },
  progressBox: { backgroundColor: colors.surface, borderRadius: 8, padding: 10, gap: 6 },
  progressLabel: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  progressValue: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18 },
  track: { height: 8, borderRadius: 9999, backgroundColor: colors.inputBg, overflow: 'hidden' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  pillEmoji: { fontSize: 12 },
  pillText: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18 },
  success: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.green },
});
