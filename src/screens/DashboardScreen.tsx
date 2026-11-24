import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar, { HEADER_HEIGHT } from '../components/dashboard/HeaderBar';
import PlayerHeroCard from '../components/dashboard/PlayerHeroCard';
import QuestToolbar, { TabKey } from '../components/dashboard/QuestToolbar';
import TaskCard from '../components/dashboard/TaskCard';
import BottomNav, { NAV_HEIGHT, NavKey } from '../components/dashboard/BottomNav';
import LeaderboardScreen from './LeaderboardScreen';
import RewardsScreen from './RewardsScreen';
import ProfileScreen from './ProfileScreen';
import TaskDetailScreen from './TaskDetailScreen';
import NotificationsScreen from './NotificationsScreen';
import { colors, fonts } from '../theme/tokens';
import { initialPlayer as emptyPlayer } from '../data/quests';
import { api, ApiError, toTask } from '../services/api';
import { requestReminderPermission, syncDeadlineReminders } from '../services/reminders';
import { buildFeed } from '../services/notificationFeed';
import type { HrisTask } from '../services/api';
import { sampleChampions } from '../data/champions';
import { initialRewards } from '../data/rewards';
import { initialProfileExtras } from '../data/profile';
import { useCountdown } from '../utils/useCountdown';
import { getInitials } from '../utils/format';
import type { Category, Champion, LeaderEntry, Player, ProfileExtras, Reward, SortKey, Task } from '../types';

// Urutan kelompok di tab "Semua" (sama dengan urutan tab di QuestToolbar).
const CATEGORY_ORDER: Category[] = ['mingguan', 'bulanan', 'harian', 'personal'];

interface Props {
  onLogout: () => void;
  initialPlayer?: Player; // profil dari respons login
}

export default function DashboardScreen({ onLogout, initialPlayer: startPlayer }: Props) {
  const insets = useSafeAreaInsets();
  const countdown = useCountdown(0);

  const [player, setPlayer] = useState<Player>(startPlayer ?? emptyPlayer);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const busy = useRef(false); // cegah ketukan ganda saat request berjalan
  const [tab, setTab] = useState<TabKey>('semua');
  const [sort, setSort] = useState<SortKey>('deadline');
  const [nav, setNav] = useState<NavKey>('tugas');
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [champions] = useState<Champion[]>(sampleChampions);
  const [rewards] = useState<Reward[]>(initialRewards);
  const [extras] = useState<ProfileExtras>(initialProfileExtras);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const askedPermission = useRef(false);
  const handledNotif = useRef<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  /** Muat daftar tugas + leaderboard dari backend. */
  const loadAll = useCallback(async () => {
    // Leaderboard dimuat terpisah: kalau gagal, daftar tugas tetap tampil.
    api
      .leaderboard()
      .then(setLeaderboard)
      .catch(() => {});
    try {
      const list = await api.tasks();
      setTasks(list.map((t) => toTask(t)));
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Gagal memuat data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Pengingat deadline otomatis: minta izin notifikasi sekali (setelah login), lalu jadwalkan ulang
  // setiap daftar tugas berhasil dimuat/berubah. Dilewati bila memuat gagal, supaya jadwal lama
  // tidak terhapus hanya karena sinyal jelek.
  useEffect(() => {
    if (loading || loadError) return;
    (async () => {
      if (!askedPermission.current) {
        askedPermission.current = true;
        await requestReminderPermission();
      }
      await syncDeadlineReminders(tasks);
    })().catch(() => {});
  }, [tasks, loading, loadError]);

  /**
   * Maju satu langkah pada tugas.
   *  - Masih ada langkah tersisa     -> POST /toggle-task-item (centang item berikutnya)
   *  - Langkah terakhir / tanpa item -> centang sisa item, POST /start-task bila masih pending,
   *                                     lalu POST /submit-task (menunggu review atasan)
   * Mengembalikan true bila berhasil.
   */
  const applyAdvance = useCallback(
    async (id: string, link?: string, note?: string): Promise<boolean> => {
      const task = tasks.find((t) => t.id === id);
      if (!task || task.status === 'claimed' || task.pendingReview || busy.current) return false;

      busy.current = true;
      try {
        const items = task.detail?.items ?? [];
        const remaining = items.filter((i) => !i.done);
        const total = task.progress ? task.progress.total : 1;
        const nextDone = (task.progress ? task.progress.done : 0) + 1;

        let result: HrisTask;
        if (nextDone < total && remaining.length > 0) {
          result = await api.toggleTaskItem(remaining[0].id);
        } else {
          if (!(link ?? '').trim()) {
            showToast('Isi tautan bukti pengerjaan dulu sebelum menyerahkan misi.');
            return false;
          }
          for (const it of remaining) await api.toggleTaskItem(it.id);
          if (task.rawStatus === 'pending') {
            try {
              await api.startTask(id);
            } catch {
              // sudah dimulai dari perangkat lain: lanjut saja
            }
          }
          // Ulasan kosong -> kirim tautan sebagai catatan agar backend (yang mewajibkan catatan) tetap menerima.
          const cleanLink = (link ?? '').trim();
          result = await api.submitTask(id, (note ?? '').trim() || cleanLink, cleanLink);
        }

        const updated = toTask(result);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));

        if (updated.pendingReview) showToast('Misi diserahkan, menunggu review atasan');
        else showToast(`Progres ${updated.progress?.done ?? nextDone}/${total}`);
        return true;
      } catch (e) {
        showToast(e instanceof ApiError ? e.message : 'Gagal menghubungi server.');
        // Status di server mungkin berbeda dari yang tampil -> segarkan daftar.
        loadAll();
        return false;
      } finally {
        busy.current = false;
      }
    },
    [tasks, showToast, loadAll],
  );

  /** Buka layar Detail Tugas (konfirmasi + klaim poin dilakukan di sana). */
  const openDetail = useCallback(
    (id: string) => {
      const t = tasks.find((x) => x.id === id);
      if (!t || t.status !== 'active') return;
      if (t.pendingReview) {
        showToast('Misi ini sedang menunggu review atasan.');
        return;
      }
      setDetailId(id);
    },
    [tasks, showToast],
  );

  const submitFromDetail = useCallback(
    async (id: string, link: string, note: string) => {
      const ok = await applyAdvance(id, link, note);
      if (ok) setDetailId(null); // gagal -> tetap di layar detail agar bisa dicoba lagi
    },
    [applyAdvance],
  );

  const visible = useMemo(() => {
    const filtered = tasks.filter((t) => tab === 'semua' || t.category === tab);
    return [...filtered].sort((a, b) => {
      if (sort === 'poin') return b.points - a.points;
      // Tab "Semua": kelompokkan per kategori (urutan sama dengan tab), baru urut deadline di dalam kelompok,
      // supaya tugas bulanan tidak terselip di antara tugas mingguan.
      if (tab === 'semua') {
        const byCat = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
        if (byCat !== 0) return byCat;
      }
      return a.deadlineOrder - b.deadlineOrder;
    });
  }, [tasks, tab, sort]);

  // "Sisa hari ini": tugas aktif non-kuartalan (variant learning = target kuartal)
  const today = tasks.filter((t) => t.status === 'active' && !t.pendingReview && t.variant !== 'learning');
  const potential = today.reduce((sum, t) => sum + t.points, 0);

  const redeem = useCallback(
    (reward: Reward) => {
      if (redeemed.includes(reward.id) || player.points < reward.cost) return;
      setPlayer((p) => ({ ...p, points: p.points - reward.cost }));
      setRedeemed((r) => [...r, reward.id]);
      showToast(`Berhasil menukar ${reward.title}`);
    },
    [player.points, redeemed, showToast],
  );

  const saveProfile = useCallback(
    ({ name, role, photoUri }: { name: string; role: string; photoUri?: string }) => {
      setPlayer((p) => ({ ...p, name, role, photoUri, initials: getInitials(name) }));
      showToast('Profil berhasil diperbarui');
    },
    [showToast],
  );

  const soon = () => showToast('Fitur ini belum tersedia (simulasi)');

  // Jumlah notifikasi yang perlu perhatian (lencana di menu Profil).
  const attentionCount = useMemo(() => buildFeed(tasks).attentionCount, [tasks]);

  // Ketuk notifikasi (termasuk saat app dibuka dari keadaan tertutup) -> buka detail tugas terkait.
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!lastResponse) return;
    const notifId = lastResponse.notification.request.identifier;
    const taskId = lastResponse.notification.request.content.data?.taskId;
    if (handledNotif.current === notifId || typeof taskId !== 'string') return;
    if (loading) return; // tunggu daftar tugas selesai dimuat
    handledNotif.current = notifId;
    openDetail(taskId);
  }, [lastResponse, loading, openDetail]);

  if (showNotif) {
    return (
      <View style={styles.root}>
        <NotificationsScreen
          tasks={tasks}
          onBack={() => setShowNotif(false)}
          onOpenTask={(id) => {
            setShowNotif(false);
            openDetail(id);
          }}
        />
        {toast && (
          <View style={[styles.toast, { bottom: insets.bottom + 24 }]} pointerEvents="none">
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
      </View>
    );
  }

  const detailTask = detailId ? tasks.find((t) => t.id === detailId) : undefined;
  if (detailTask) {
    return (
      <View style={styles.root}>
        <TaskDetailScreen
          task={detailTask}
          points={player.points}
          initials={player.initials}
          photoUri={player.photoUri}
          onBack={() => setDetailId(null)}
          onSubmit={(link, note) => submitFromDetail(detailTask.id, link, note)}
          onSoon={soon}
        />
        {toast && (
          <View style={[styles.toast, { bottom: insets.bottom + 24 }]} pointerEvents="none">
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top,
          paddingBottom: NAV_HEIGHT + insets.bottom + 32,
          paddingHorizontal: 16,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        refreshControl={
          nav === 'tugas' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadAll();
              }}
              tintColor={colors.primary}
              progressViewOffset={HEADER_HEIGHT + insets.top}
            />
          ) : undefined
        }
      >
        {nav === 'tugas' && (
          <>
            <PlayerHeroCard player={player} tasksLeft={today.length} potentialPoints={potential} />

            <QuestToolbar countdown={countdown} tab={tab} onTab={setTab} sort={sort} onSort={setSort} />

            <View style={{ gap: 16 }}>
              {visible.map((t) => (
                <TaskCard key={t.id} task={t} onOpen={openDetail} />
              ))}
              {loading && <ActivityIndicator color={colors.primary} style={{ paddingVertical: 24 }} />}
              {!loading && loadError && (
                <Pressable
                  onPress={() => {
                    setLoading(true);
                    loadAll();
                  }}
                >
                  <Text style={styles.empty}>{loadError} Ketuk untuk coba lagi.</Text>
                </Pressable>
              )}
              {!loading && !loadError && visible.length === 0 && (
                <Text style={styles.empty}>Belum ada misi di kategori ini.</Text>
              )}
            </View>
          </>
        )}

        {nav === 'peringkat' && <LeaderboardScreen player={player} entries={leaderboard} champions={champions} />}

        {nav === 'hadiah' && (
          <RewardsScreen points={player.points} rewards={rewards} redeemed={redeemed} onRedeem={redeem} />
        )}

        {nav === 'profil' && (
          <ProfileScreen
            player={player}
            tasks={tasks}
            rewards={rewards}
            redeemed={redeemed}
            extras={extras}
            onLogout={onLogout}
            onSoon={soon}
            notifCount={attentionCount}
            onOpenNotifications={() => setShowNotif(true)}
            onGoRewards={() => setNav('hadiah')}
            onSaveProfile={saveProfile}
          />
        )}
      </ScrollView>

      <HeaderBar
        streak={player.streak}
        points={player.points}
        level={player.level}
        initials={player.initials}
        photoUri={player.photoUri}
        onAvatarPress={() => setNav('profil')}
      />

      {toast && (
        <View style={[styles.toast, { bottom: NAV_HEIGHT + insets.bottom + 12 }]} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <BottomNav active={nav} onPress={setNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  empty: {
    textAlign: 'center',
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: 24,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: colors.surfaceHighest,
    borderWidth: 1,
    borderColor: colors.outline,
    zIndex: 20,
  },
  toastText: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.gold },
});
