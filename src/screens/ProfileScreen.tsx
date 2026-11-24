import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from '../components/dashboard/Avatar';
import EditProfileScreen from './EditProfileScreen';
import { colors, fonts } from '../theme/tokens';
import { EXP_PER_LEVEL, LEVEL_TITLES } from '../data/quests';
import { fmtId } from '../utils/format';
import type { Badge, Player, ProfileExtras, Reward, Task, Tone } from '../types';

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Props {
  player: Player;
  tasks: Task[];
  rewards: Reward[];
  redeemed: string[];
  extras: ProfileExtras;
  onLogout: () => void;
  onSoon: () => void;
  notifCount: number; // jumlah notifikasi yang perlu perhatian (lencana)
  onOpenNotifications: () => void;
  onGoRewards: () => void;
  onSaveProfile: (data: { name: string; role: string; photoUri?: string }) => void;
}

const TONE: Record<Tone, { fg: string; bg: string }> = {
  gold: { fg: colors.gold, bg: 'rgba(255,185,95,0.16)' },
  primary: { fg: colors.primarySoft, bg: 'rgba(108,92,231,0.22)' },
  green: { fg: colors.green, bg: 'rgba(78,222,163,0.16)' },
};

const icon = (name: string) => name as MCIName;

/* ───────────────────────── bagian kecil ───────────────────────── */

function SectionHeader({
  icon: ic,
  title,
  right,
  rightGold,
  onRight,
}: {
  icon: MCIName;
  title: string;
  right?: string;
  rightGold?: boolean;
  onRight?: () => void;
}) {
  return (
    <View style={styles.secHead}>
      <View style={styles.secLeft}>
        <MaterialCommunityIcons name={ic} size={18} color={colors.textMuted} />
        <Text style={styles.secTitle}>{title}</Text>
      </View>
      {right ? (
        <Pressable onPress={onRight} disabled={!onRight} hitSlop={8} accessibilityRole={onRight ? 'button' : undefined}>
          <Text style={[styles.secRight, rightGold && { color: colors.gold, fontFamily: fonts.outfitBold }]}>{right}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function StatCard({
  icon: ic,
  tone,
  chip,
  value,
  label,
}: {
  icon: MCIName;
  tone: Tone | 'muted';
  chip?: string;
  value: string;
  label: string;
}) {
  const t = tone === 'muted' ? { fg: colors.textMuted, bg: colors.surfaceHighest } : TONE[tone];
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <View style={[styles.statIcon, { backgroundColor: t.bg }]}>
          <MaterialCommunityIcons name={ic} size={16} color={t.fg} />
        </View>
        {chip ? (
          <View style={[styles.chip, { backgroundColor: t.bg }]}>
            <Text style={[styles.chipText, { color: t.fg }]}>{chip}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BadgeCard({ badge, progress }: { badge: Badge; progress: number }) {
  const t = TONE[badge.tone];
  const unlocked = badge.unlocked || progress >= 1;
  return (
    <View style={styles.badgeCard}>
      <View style={[styles.badgeIcon, { backgroundColor: unlocked ? t.bg : colors.surfaceHighest }]}>
        <MaterialCommunityIcons
          name={unlocked ? icon(badge.icon) : 'lock-outline'}
          size={24}
          color={unlocked ? t.fg : colors.textSubtle}
        />
      </View>
      <Text style={[styles.badgeTitle, !unlocked && { color: colors.textFaint }]} numberOfLines={1}>
        {badge.title}
      </Text>
      <Text style={styles.badgeDesc} numberOfLines={2}>
        {badge.desc}
      </Text>
      {unlocked ? (
        <View style={[styles.tierPill, { backgroundColor: t.fg }]}>
          <Text style={styles.tierText}>{badge.label}</Text>
        </View>
      ) : (
        <View style={{ alignSelf: 'stretch', gap: 4 }}>
          <View style={styles.gauge}>
            <View style={[styles.gaugeFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={styles.badgeProgress}>{Math.round(progress * 100)}% Menuju Terbuka</Text>
        </View>
      )}
    </View>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function ConfigRow({
  icon: ic,
  tone,
  title,
  sub,
  onPress,
  divider,
  right,
}: {
  icon: MCIName;
  tone: Tone;
  title: string;
  sub: string;
  onPress: () => void;
  divider?: boolean;
  right?: React.ReactNode; // pengganti panah di kanan (mis. Switch)
}) {
  return (
    <Pressable onPress={onPress} style={[styles.cfgRow, divider && styles.cfgDivider]} accessibilityRole="button">
      <View style={styles.cfgIcon}>
        <MaterialCommunityIcons name={ic} size={18} color={TONE[tone].fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cfgTitle}>{title}</Text>
        <Text style={styles.cfgSub}>{sub}</Text>
      </View>
      {right ?? <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSubtle} />}
    </Pressable>
  );
}

/* ───────────────────────── layar ───────────────────────── */

export default function ProfileScreen({
  player,
  tasks,
  rewards,
  redeemed,
  extras,
  onLogout,
  onSoon,
  notifCount,
  onOpenNotifications,
  onGoRewards,
  onSaveProfile,
}: Props) {
  const [editing, setEditing] = useState(false);

  const stats = useMemo(() => {
    const claimed = tasks.filter((t) => t.status === 'claimed');
    return {
      done: claimed.length,
      mingguan: claimed.filter((t) => t.category === 'mingguan').length,
      bulanan: claimed.filter((t) => t.category === 'bulanan').length,
      harian: claimed.filter((t) => t.category === 'harian').length,
      // log terbaru dulu (claimedAt = "HH:MM WIB")
      recent: [...claimed]
        .sort((a, b) => (b.claimedAt ?? '').localeCompare(a.claimedAt ?? ''))
        .slice(0, 3),
    };
  }, [tasks]);

  const vouchers = rewards.filter((r) => redeemed.includes(r.id));

  const confirmLogout = () =>
    Alert.alert('Keluar?', 'Kamu akan kembali ke gerbang login.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: onLogout },
    ]);

  if (editing) {
    return (
      <EditProfileScreen
        player={player}
        onCancel={() => setEditing(false)}
        onSave={(data) => {
          onSaveProfile(data);
          setEditing(false);
        }}
      />
    );
  }

  const pct = Math.min(100, (player.exp / EXP_PER_LEVEL) * 100);
  const nextLevel = player.level + 1;
  const title = LEVEL_TITLES[player.level] ?? 'Petualang';
  const roleLine = player.role ? `${title} & ${player.role}` : title;

  return (
    <View style={{ gap: 24 }}>
      {/* ── Kartu profil ── */}
      <LinearGradient
        colors={['rgba(108,92,231,0.38)', colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Pressable
          onPress={() => setEditing(true)}
          style={styles.editBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit profil"
        >
          <MaterialCommunityIcons name="pencil" size={16} color={colors.text} />
        </Pressable>

        <View style={styles.heroTop}>
          <View>
            <View style={styles.avatarRing}>
              <Avatar initials={player.initials} photoUri={player.photoUri} size={72} />
            </View>
            <View style={styles.lvBadge}>
              <Text style={styles.lvBadgeText}>Lv. {player.level}</Text>
            </View>
          </View>
          <View style={{ flex: 1, paddingRight: 28 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {player.name}
              </Text>
              <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primarySoft} />
            </View>
            <Text style={styles.role} numberOfLines={2}>
              {roleLine}
            </Text>
            {extras.guild ? (
              <View style={styles.guildRow}>
                <MaterialCommunityIcons name="shield-outline" size={13} color={colors.textMuted} />
                <Text style={styles.guild} numberOfLines={1}>
                  {extras.guild}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.miniRow}>
          <View style={styles.mini}>
            <MaterialCommunityIcons name="fire" size={18} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.miniTitle, { color: colors.gold }]}>{player.streak} Hari Streak</Text>
              <Text style={styles.miniSub}>Konsistensi Harian</Text>
            </View>
          </View>
          <View style={styles.mini}>
            <MaterialCommunityIcons name="trophy" size={18} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.miniTitle, { color: colors.primarySoft }]}>
                Rank {extras.seasonRank ? `#${extras.seasonRank}` : '–'} Musim Ini
              </Text>
              <Text style={styles.miniSub} numberOfLines={1}>
                {extras.league}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.expBox}>
          <View style={styles.expTop}>
            <View style={styles.expLeft}>
              <MaterialCommunityIcons name="flash" size={14} color={colors.green} />
              <Text style={styles.expTitle}>Progres Pengalaman (EXP)</Text>
            </View>
            <Text style={styles.expValue}>
              {fmtId(player.exp)} / {fmtId(EXP_PER_LEVEL)} EXP
            </Text>
          </View>
          <View style={styles.expGauge}>
            <LinearGradient
              colors={[colors.primary, colors.primarySoft, colors.green]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.expFill, { width: `${pct}%` }]}
            />
          </View>
          <View style={styles.expBottom}>
            <Text style={styles.expHint}>Sisa {fmtId(EXP_PER_LEVEL - player.exp)} EXP menuju level berikutnya</Text>
            <Text style={styles.expNext}>
              Lv. {nextLevel}
              {LEVEL_TITLES[nextLevel] ? ` ${LEVEL_TITLES[nextLevel]}` : ''} →
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Statistik Tempur ── */}
      <View style={{ gap: 12 }}>
        <SectionHeader icon="gamepad-variant-outline" title="Statistik Tempur" right={`Musim ${extras.season} Aktif`} />
        <View style={styles.grid}>
          <StatCard
            icon="star"
            tone="gold"
            chip={player.weekExp > 0 ? `+${fmtId(player.weekExp)} mgg ini` : undefined}
            value={fmtId(player.points)}
            label="Total Poin Emas"
          />
          <StatCard
            icon="check-circle-outline"
            tone="primary"
            chip={`${stats.done} Misi`}
            value={String(stats.done)}
            label={`${stats.mingguan} Mingguan • ${stats.bulanan} Bulanan • ${stats.harian} Harian`}
          />
          <StatCard
            icon="timer-outline"
            tone="green"
            chip={extras.onTimeTier || undefined}
            value={extras.onTimeRate == null ? '–' : `${extras.onTimeRate.toFixed(1)}%`}
            label="On-Time Win Rate"
          />
          <StatCard
            icon="trophy-outline"
            tone="muted"
            chip={extras.bestRankSeason ? `Musim ${extras.bestRankSeason}` : undefined}
            value={extras.bestRank == null ? '–' : extras.bestRank === 1 ? '#1 Juara' : `#${extras.bestRank}`}
            label="Peringkat Tertinggi"
          />
        </View>
      </View>

      {/* ── Lencana Kehormatan ── */}
      <View style={{ gap: 12 }}>
        <SectionHeader
          icon="medal-outline"
          title="Lencana Kehormatan"
          right={`Semua (${extras.badges.length}) ›`}
          onRight={onSoon}
        />
        <View style={styles.grid}>
          {extras.badges.map((b) => (
            <BadgeCard
              key={b.id}
              badge={b}
              progress={b.pointsTarget ? Math.min(1, player.points / b.pointsTarget) : b.unlocked ? 1 : 0}
            />
          ))}
        </View>
      </View>

      {/* ── Inventaris & Voucher Aktif ── */}
      <View style={{ gap: 12 }}>
        <SectionHeader
          icon="ticket-confirmation-outline"
          title="Inventaris & Voucher Aktif"
          right="Tukar Poin →"
          rightGold
          onRight={onGoRewards}
        />
        {vouchers.length === 0 ? (
          <EmptyNote text="Belum ada voucher. Tukar poinmu di halaman Hadiah." />
        ) : (
          vouchers.map((v) => (
            <View key={v.id} style={styles.voucher}>
              <View style={styles.voucherIcon}>
                <MaterialCommunityIcons name={icon(v.icon)} size={22} color={TONE[v.tone].fg} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.readyPill}>
                  <Text style={styles.readyText}>Siap Pakai</Text>
                </View>
                <Text style={styles.voucherTitle} numberOfLines={1}>
                  {v.title}
                </Text>
                <Text style={styles.voucherSub} numberOfLines={1}>
                  {v.desc}
                </Text>
              </View>
              <Pressable onPress={onSoon} style={styles.showBtn} accessibilityRole="button">
                <Text style={styles.showBtnText}>Tunjukkan</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* ── Log Aktivitas Quest Terkini ── */}
      <View style={{ gap: 12 }}>
        <SectionHeader icon="script-text-outline" title="Log Aktivitas Quest Terkini" right="Real-time" />
        {stats.recent.length === 0 ? (
          <EmptyNote text="Belum ada aktivitas. Selesaikan misi pertamamu!" />
        ) : (
          <View style={styles.logCard}>
            {stats.recent.map((t, i) => (
              <View key={t.id} style={[styles.logRow, i > 0 && styles.logDivider]}>
                <View style={styles.logIcon}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={colors.primarySoft} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={styles.logSub} numberOfLines={1}>
                    {t.code}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.logPoints}>+{fmtId(t.points)} Poin</Text>
                  <Text style={styles.logTime}>Hari ini, {(t.claimedAt ?? '').replace(' WIB', '')}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── Konfigurasi Petualang ── */}
      <View style={{ gap: 12 }}>
        <SectionHeader icon="tune-variant" title="Konfigurasi Petualang" />
        <View style={styles.cfgCard}>
          <ConfigRow
            icon="bell-ring-outline"
            tone="primary"
            title="Notifikasi Tugas & Deadline"
            sub="Cek pengingat tugas dan deadline kamu"
            onPress={onOpenNotifications}
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {notifCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
                  </View>
                )}
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSubtle} />
              </View>
            }
          />
          <ConfigRow
            icon="palette-outline"
            tone="gold"
            title="Kustomisasi Karakter & Gelar"
            sub="Ganti skin avatar, border, dan banner"
            onPress={() => setEditing(true)}
            divider
          />
          <ConfigRow
            icon="shield-check"
            tone="green"
            title="Keamanan Akun & SSO Kantor"
            sub="Terhubung ke Google Workspace"
            onPress={onSoon}
            divider
          />
        </View>
      </View>

      <Pressable onPress={confirmLogout} style={styles.logout} accessibilityRole="button">
        <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Keluar dari Sesi Guild (Logout)</Text>
      </Pressable>
    </View>
  );
}

const CARD = {
  borderRadius: 16,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.outline,
} as const;

const styles = StyleSheet.create({
  notifBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  notifBadgeText: { fontFamily: fonts.outfitBold, fontSize: 11, color: '#3a0a0a' },

  /* hero */
  hero: { borderRadius: 20, padding: 16, gap: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.outline },
  editBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarRing: {
    padding: 3,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  lvBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: colors.gold,
  },
  lvBadgeText: { fontFamily: fonts.outfitExtraBold, fontSize: 11, color: colors.bg },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontFamily: fonts.outfitExtraBold, fontSize: 20, lineHeight: 26, color: colors.text },
  role: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  guildRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  guild: { flexShrink: 1, fontFamily: fonts.jakartaRegular, fontSize: 12, color: colors.textMuted },
  miniRow: { flexDirection: 'row', gap: 8 },
  mini: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  miniTitle: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16 },
  miniSub: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 15, color: colors.textMuted },
  expBox: { gap: 8, padding: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)' },
  expTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  expLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  expTitle: { fontFamily: fonts.outfitBold, fontSize: 12, color: colors.text },
  expValue: { fontFamily: fonts.outfitBold, fontSize: 12, color: colors.green },
  expGauge: { height: 8, borderRadius: 9999, backgroundColor: colors.inputBg, overflow: 'hidden' },
  expFill: { height: '100%', borderRadius: 9999 },
  expBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  expHint: { flex: 1, fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 16, color: colors.textMuted },
  expNext: { fontFamily: fonts.outfitBold, fontSize: 11, lineHeight: 16, color: colors.gold, textAlign: 'right' },

  /* section */
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secTitle: { fontFamily: fonts.outfitExtraBold, fontSize: 15, color: colors.text },
  secRight: { fontFamily: fonts.jakartaRegular, fontSize: 12, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  /* stat */
  statCard: { ...CARD, flexBasis: '45%', flexGrow: 1, padding: 14, gap: 4 },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  chipText: { fontFamily: fonts.outfitBold, fontSize: 10, lineHeight: 15 },
  statValue: { fontFamily: fonts.outfitExtraBold, fontSize: 24, lineHeight: 30, color: colors.text },
  statLabel: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 16, color: colors.textMuted },

  /* badge */
  badgeCard: { ...CARD, flexBasis: '45%', flexGrow: 1, padding: 14, alignItems: 'center', gap: 6 },
  badgeIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  badgeTitle: { fontFamily: fonts.outfitBold, fontSize: 14, lineHeight: 18, color: colors.text, textAlign: 'center' },
  badgeDesc: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    textAlign: 'center',
    minHeight: 30,
  },
  tierPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 9999, marginTop: 2 },
  tierText: { fontFamily: fonts.outfitExtraBold, fontSize: 10, letterSpacing: 0.5, color: colors.bg },
  gauge: { height: 5, borderRadius: 9999, backgroundColor: colors.inputBg, overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 9999, backgroundColor: colors.amber },
  badgeProgress: { fontFamily: fonts.outfitBold, fontSize: 10, color: colors.gold, textAlign: 'center' },

  /* voucher */
  voucher: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  voucherIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest,
  },
  readyPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(0,130,89,0.3)',
  },
  readyText: { fontFamily: fonts.outfitBold, fontSize: 10, lineHeight: 15, color: colors.green },
  voucherTitle: { fontFamily: fonts.outfitBold, fontSize: 14, lineHeight: 18, color: colors.text },
  voucherSub: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 15, color: colors.textMuted },
  showBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.gold,
    borderBottomWidth: 3,
    borderBottomColor: colors.amber,
  },
  showBtnText: { fontFamily: fonts.outfitBold, fontSize: 12, color: colors.bg },
  emptyBox: { ...CARD, padding: 18, alignItems: 'center' },
  emptyText: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted, textAlign: 'center' },

  /* log */
  logCard: { ...CARD, padding: 6 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  logDivider: { borderTopWidth: 1, borderTopColor: colors.outline },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(108,92,231,0.22)',
  },
  logTitle: { fontFamily: fonts.outfitBold, fontSize: 13, lineHeight: 18, color: colors.text },
  logSub: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 15, color: colors.textMuted },
  logPoints: { fontFamily: fonts.outfitExtraBold, fontSize: 12, color: colors.gold },
  logTime: { fontFamily: fonts.jakartaRegular, fontSize: 10, lineHeight: 15, color: colors.textMuted },

  /* konfigurasi */
  cfgCard: { ...CARD, paddingHorizontal: 6 },
  cfgRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, paddingVertical: 12 },
  cfgDivider: { borderTopWidth: 1, borderTopColor: colors.outline },
  cfgIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest,
  },
  cfgTitle: { fontFamily: fonts.outfitBold, fontSize: 14, lineHeight: 18, color: colors.text },
  cfgSub: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 16, color: colors.textMuted },

  /* logout */
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,138,138,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,138,0.25)',
  },
  logoutText: { fontFamily: fonts.outfitBold, fontSize: 14, color: colors.danger },
});
