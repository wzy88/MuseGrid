import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Toaster, toast } from 'sonner';
import { Sidebar, type Page } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomPlayer } from './components/layout/BottomPlayer';
import { HomePage } from './components/pages/HomePage';
import { ProductionPage } from './components/pages/ProductionPage';
import { AvatarNetworkPage } from './components/pages/AvatarNetworkPage';
import { CreateAvatarPage } from './components/pages/CreateAvatarPage';
import { MyWorksPage } from './components/pages/MyWorksPage';
import { WorkEditPage } from './components/pages/WorkEditPage';
import { AvatarManagePage } from './components/pages/AvatarManagePage';
import { EvolutionReportPage } from './components/pages/EvolutionReportPage';
import { CalibrationPage } from './components/pages/CalibrationPage';
import { ContributionPage } from './components/pages/ContributionPage';
import { BillingPage } from './components/pages/BillingPage';
import { DesignSystemPage } from './components/pages/DesignSystemPage';
import { LayoutGrid, Package } from 'lucide-react';
import { C, getThemeVariables, type ThemeMode } from './design/tokens';
import { HandoffPage } from './components/pages/HandoffPage';
import {
  DEFAULT_PROJECT,
  SAMPLE_WORKS,
  STEP_META,
  avatarDirectionForStepIndex,
  avatarDirectionForStepLabel,
  buildProjectFromIdea,
  createSteps,
  generatedWorkFromProject,
  mergeAvatarProfiles,
  normalizeAvatar,
  type AvatarCalibration,
  type AvatarProfile,
  type ContributionSnapshot,
  type GenerationMusicOutput,
  type GenerationStepOutput,
  type GeneratedWork,
  type ProjectBrief,
  type StepState,
} from './state/mockProject';
import { createDefaultSnapshot, createMuseGridStore, type MuseGridUser } from './data/musegridStore';
import { fetchCloudAvatars, getCreatorId } from './data/avatarClient';
import { fetchCloudWork, fetchCloudWorks, fetchPublicWorks, hasWorkApi, saveCloudWork } from './data/workClient';
import { BILLING_PLANS, DEMO_GENERATION_CREDIT_COST, createDefaultBilling, type BillingPeriod, type BillingPlanId, type BillingState } from './state/billing';
import { getInitialThemeMode, THEME_MODE_STORAGE_KEY } from './design/themeMode';

export default function App() {
  const store = useMemo(() => createMuseGridStore(), []);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'deep';
    return getInitialThemeMode(window.localStorage);
  });
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<MuseGridUser | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showDS, setShowDS] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [project, setProject] = useState<ProjectBrief>(DEFAULT_PROJECT);
  const [steps, setSteps] = useState<StepState[]>(createSteps(true));
  const [currentStep, setCurrentStep] = useState(0);
  const [contributions, setContributions] = useState<ContributionSnapshot[]>([]);
  const [avatars, setAvatars] = useState<AvatarProfile[]>([]);
  const [activeAvatarId, setActiveAvatarId] = useState<string | number | null>(null);
  const [summonedAvatarId, setSummonedAvatarId] = useState<string | number | null>(null);
  const [calibrations, setCalibrations] = useState<AvatarCalibration[]>([]);
  const [works, setWorks] = useState<GeneratedWork[]>(SAMPLE_WORKS);
  const [activeWorkId, setActiveWorkId] = useState<string | number | null>(null);
  const [billing, setBilling] = useState<BillingState>(createDefaultBilling());
  const [playingWorkId, setPlayingWorkId] = useState<string | number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [avatarNetworkRequiredDirection, setAvatarNetworkRequiredDirection] = useState<string | null>(null);
  const didHydrate = useRef(false);
  const playingWork = works.find((work) => work.id === playingWorkId) ?? works.find((work) => work.id === activeWorkId) ?? null;
  const themeVariables = getThemeVariables(themeMode);

  function handleToggleTheme() {
    setThemeMode((current) => {
      const next = current === 'deep' ? 'light' : 'deep';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_MODE_STORAGE_KEY, next);
      }
      return next;
    });
  }

  const navigate = (page: Page) => {
    if (page === 'avatarNetwork') {
      setAvatarNetworkRequiredDirection(null);
    }
    setCurrentPage(page);
    setShowDS(false);
    setShowHandoff(false);
  };

  const navigateToAvatarNetworkForStep = () => {
    setAvatarNetworkRequiredDirection(avatarDirectionForStepIndex(currentStep) || null);
    setCurrentPage('avatarNetwork');
    setShowDS(false);
    setShowHandoff(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const currentUser = await store.getCurrentUser();
        const snapshot = await store.loadSnapshot(currentUser?.id);
        const shareWorkId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('work') : null;
        let nextWorks = snapshot.works;
        let nextActiveWorkId = snapshot.activeWorkId;
        if (shareWorkId && hasWorkApi()) {
          try {
            const sharedWork = await fetchCloudWork(shareWorkId);
            nextWorks = [sharedWork, ...nextWorks.filter((work) => work.id !== sharedWork.id)];
            nextActiveWorkId = sharedWork.id;
          } catch (error) {
            console.info('shared work load skipped', error);
          }
        }
        if (cancelled) return;
        setUser(currentUser);
        setProject(snapshot.project);
        setSteps(snapshot.steps);
        setCurrentStep(snapshot.currentStep);
        setContributions(snapshot.contributions);
        setAvatars(snapshot.avatars);
        setActiveAvatarId(snapshot.activeAvatarId);
        setWorks(nextWorks);
        setActiveWorkId(nextActiveWorkId);
        setBilling(snapshot.billing);
        if (shareWorkId) {
          setCurrentPage('myWorks');
        }
      } catch (error) {
        console.error(error);
        const fallback = createDefaultSnapshot();
        if (cancelled) return;
        setProject(fallback.project);
        setSteps(fallback.steps);
        setCurrentStep(fallback.currentStep);
        setContributions(fallback.contributions);
        setAvatars(fallback.avatars);
        setActiveAvatarId(fallback.activeAvatarId);
        setWorks(fallback.works);
        setActiveWorkId(fallback.activeWorkId);
        setBilling(fallback.billing);
      } finally {
        if (!cancelled) {
          didHydrate.current = true;
          setBooting(false);
        }
      }
    }

    boot();
    return () => { cancelled = true; };
  }, [store]);

  useEffect(() => {
    if (!didHydrate.current) return;
    const creatorId = getCreatorId();
    fetchCloudAvatars(creatorId)
      .then((cloudAvatars) => {
        if (cloudAvatars.length === 0) return;
        setAvatars((current) => {
          const byId = new Map<string | number, AvatarProfile>();
          current.forEach((avatar) => byId.set(avatar.id, avatar));
          cloudAvatars.forEach((avatar) => byId.set(avatar.id, avatar));
          return mergeAvatarProfiles([...byId.values()]);
        });
        setActiveAvatarId((current) => current ?? cloudAvatars[0]?.id ?? null);
      })
      .catch((error) => {
        console.info('avatar cloud load skipped', error);
      });
    const mergeCloudWorks = (cloudWorks: GeneratedWork[]) => {
      setWorks((current) => {
        const byId = new Map<string | number, GeneratedWork>();
        current.forEach((work) => byId.set(work.id, work));
        cloudWorks.forEach((work) => byId.set(work.id, work));
        return [...byId.values()];
      });
    };
    const loadCreatorWorks = () =>
      fetchCloudWorks(creatorId)
        .then((cloudWorks) => {
          if (cloudWorks.length > 0) mergeCloudWorks(cloudWorks);
        });
    fetchPublicWorks()
      .then((cloudWorks) => {
        if (cloudWorks.length > 0) {
          mergeCloudWorks(cloudWorks);
          return;
        }
        return loadCreatorWorks();
      })
      .catch((error) => {
        console.info('public work cloud load skipped', error);
        loadCreatorWorks()
          .catch((fallbackError) => {
            console.info('creator work cloud load skipped', fallbackError);
          });
      });
  }, [booting]);

  useEffect(() => {
    if (!didHydrate.current) return;
    store.saveSnapshot({
      project,
      steps,
      currentStep,
      contributions,
      avatars,
      activeAvatarId,
      works,
      activeWorkId,
      billing,
      updatedAt: new Date().toISOString(),
    }, user?.id).catch((error) => {
      console.error(error);
    });
  }, [activeAvatarId, activeWorkId, avatars, billing, contributions, currentStep, project, steps, store, user?.id, works]);

  function startProjectFromIdea(idea: string, options?: Pick<ProjectBrief, 'language' | 'genre' | 'mood' | 'intendedUse'>) {
    const nextProject = { ...buildProjectFromIdea(idea), ...options };
    setProject(nextProject);
    setSteps(createSteps(false));
    setCurrentStep(0);
    setContributions([]);
    setActiveWorkId(null);
    navigate('production');
  }

  function continueSampleProject() {
    setProject(DEFAULT_PROJECT);
    setSteps(createSteps(true));
    setCurrentStep(0);
    setContributions([]);
    setActiveWorkId(1);
    navigate('production');
  }

  function handleDemoGenerated(nextContributions: ContributionSnapshot[], musicOutput?: GenerationMusicOutput | null, stepOutputs: (GenerationStepOutput | null | undefined)[] = []) {
    const nextWork = generatedWorkFromProject(project, nextContributions, musicOutput, stepOutputs);
    setWorks((current) => [nextWork, ...current.filter((work) => work.id !== nextWork.id)]);
    setActiveWorkId(nextWork.id);
    saveCloudWork(getCreatorId(), nextWork, project)
      .then((cloudWork) => {
        setWorks((current) => [cloudWork, ...current.filter((work) => work.id !== nextWork.id && work.id !== cloudWork.id)]);
        setActiveWorkId(cloudWork.id);
      })
      .catch((error) => {
        console.info('work cloud save skipped', error);
      });
  }

  function handleUpgradePlan(planId: BillingPlanId, period: BillingPeriod = billing.period) {
    const plan = BILLING_PLANS.find((item) => item.id === planId) ?? BILLING_PLANS[0];
    const renewalAt = new Date();
    renewalAt.setMonth(renewalAt.getMonth() + (period === 'yearly' ? 12 : period === 'quarterly' ? 3 : 1));
    setBilling((current) => ({
      ...current,
      planId,
      period,
      credits: plan.credits,
      renewalAt: renewalAt.toISOString(),
      simulatedRevenue: Math.max(current.simulatedRevenue, 237.2),
      updatedAt: new Date().toISOString(),
    }));
  }

  function handlePeriodChange(period: BillingPeriod) {
    setBilling((current) => ({ ...current, period, updatedAt: new Date().toISOString() }));
  }

  function handleConsumeCredits(amount: number) {
    setBilling((current) => ({
      ...current,
      credits: Math.max(0, current.credits - amount),
      updatedAt: new Date().toISOString(),
    }));
  }

  function handlePlayWork(work: GeneratedWork) {
    setPlayingWorkId(work.id);
    setActiveWorkId(work.id);
    setIsPlaying(true);
  }

  function handleEditWork(work: GeneratedWork) {
    setActiveWorkId(work.id);
    navigate('workEdit');
  }

  function handleWorkTitleSave(title: string) {
    if (activeWorkId === null) return;
    const work = works.find((item) => item.id === activeWorkId);
    if (!work) return;
    const updatedWork = { ...work, title, updatedAt: new Date().toISOString() };
    setWorks((current) => current.map((item) => item.id === activeWorkId ? updatedWork : item));
    if (hasWorkApi()) {
      saveCloudWork(getCreatorId(), updatedWork, project)
        .then((cloudWork) => {
          setWorks((current) => current.map((item) => item.id === activeWorkId ? cloudWork : item));
        })
        .catch((error) => {
          console.info('work title cloud save skipped', error);
          toast.info('歌曲名称已保存在当前设备，云端同步暂未完成');
        });
    }
    navigate('myWorks');
    toast.success('歌曲名称已更新');
  }

  function handleAvatarCreated(avatar: AvatarProfile) {
    const normalized = normalizeAvatar(avatar);
    setAvatars((current) => mergeAvatarProfiles([normalized, ...current.filter((item) => item.id !== normalized.id)]));
    setActiveAvatarId(normalized.id);
  }

  function handleAvatarUpdated(avatar: AvatarProfile, calibration?: AvatarCalibration) {
    const normalized = normalizeAvatar(avatar);
    setAvatars((current) => mergeAvatarProfiles(current.map((item) => item.id === normalized.id ? normalized : item)));
    setActiveAvatarId(normalized.id);
    if (calibration) {
      setCalibrations((current) => [calibration, ...current.filter((item) => item.id !== calibration.id)]);
    }
  }

  function handleSummonAvatarFromNetwork(avatarId: string | number) {
    const avatarPool = mergeAvatarProfiles(avatars);
    const avatar = avatarPool.find((item) => item.id === avatarId);
    const requiredDirection = avatarNetworkRequiredDirection;
    if (requiredDirection && avatar?.dir !== requiredDirection) {
      toast.info(`当前环节只能选择${requiredDirection}分身`);
      return;
    }
    const targetStep = requiredDirection
      ? currentStep
      : Math.max(0, STEP_META.findIndex((step) => avatarDirectionForStepLabel(step.label) === avatar?.dir));
    setSummonedAvatarId(avatarId);
    setActiveAvatarId(avatarId);
    setCurrentStep(targetStep);
    setSteps((current) => current.map((step, index) => index === targetStep ? { ...step, status: 'active', mode: 'choose', confirmed: false } : step));
  }

  return (
    <>
      {/* Toaster for action feedback */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(31,37,54,0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.92)',
            borderRadius: 12,
          },
        }}
        richColors
      />

      <div
        data-theme-mode={themeMode}
        style={{
        ...themeVariables,
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: C.bg0,
        fontFamily: "'Noto Sans SC','PingFang SC','Inter',sans-serif",
        position: 'relative',
      } as CSSProperties}
      >
        <Sidebar
          currentPage={currentPage}
          navigate={navigate}
          user={user}
          storeMode={store.mode}
          credits={billing.credits}
          worksCount={works.length}
          avatarsCount={avatars.length}
        />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
          {/* Top bar + design system toggle */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <TopBar
                user={user}
                storeMode={store.mode}
                booting={booting}
                credits={billing.credits}
                onOpenBilling={() => navigate('billing')}
                themeMode={themeMode}
                onToggleTheme={handleToggleTheme}
              />
            </div>
            <button
              onClick={() => setShowDS(v => !v)}
              style={{
                height: 52,
                padding: '0 16px',
                borderLeft: `1px solid ${C.lineSubtle}`,
                borderBottom: `1px solid ${C.lineSubtle}`,
                background: showDS ? C.accentDim : 'transparent',
                color: showDS ? C.accentLight : C.t3,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
              }}
            >
              <LayoutGrid size={13} />
              设计系统
            </button>
            <button
              onClick={() => { setShowHandoff(v => !v); setShowDS(false); }}
              style={{
                height: 52,
                padding: '0 16px',
                borderLeft: `1px solid ${C.lineSubtle}`,
                borderBottom: `1px solid ${C.lineSubtle}`,
                background: showHandoff ? 'rgba(16,185,129,0.1)' : 'transparent',
                color: showHandoff ? '#34D399' : C.t3,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
              }}
            >
              <Package size={13} />
              研发交付
            </button>
          </div>

          <main style={{ flex: 1, overflow: 'hidden' }}>
            {showHandoff
              ? <HandoffPage navigate={navigate} />
              : showDS
              ? <DesignSystemPage />
              : <>
                  {currentPage === 'home'           && <HomePage           navigate={navigate} onStartProject={startProjectFromIdea} onContinueProject={continueSampleProject} works={works} />}
                  {currentPage === 'production'      && <ProductionPage      navigate={navigate} navigateToAvatarNetworkForStep={navigateToAvatarNetworkForStep} project={project} steps={steps} setSteps={setSteps} current={currentStep} setCurrent={setCurrentStep} contributions={contributions} setContributions={setContributions} onDemoGenerated={handleDemoGenerated} avatars={avatars} summonedAvatarId={summonedAvatarId} credits={billing.credits} demoCreditCost={DEMO_GENERATION_CREDIT_COST} onConsumeCredits={handleConsumeCredits} onOpenBilling={() => navigate('billing')} />}
                  {currentPage === 'avatarNetwork'   && <AvatarNetworkPage   navigate={navigate} avatars={avatars} onSummonAvatar={handleSummonAvatarFromNetwork} requiredDirection={avatarNetworkRequiredDirection} />}
                  {currentPage === 'createAvatar'    && <CreateAvatarPage    navigate={navigate} onAvatarCreated={handleAvatarCreated} />}
                  {currentPage === 'myWorks'         && <MyWorksPage         navigate={navigate} works={works} activeWorkId={activeWorkId} onPlayWork={handlePlayWork} playingWorkId={playingWorkId} onEditWork={handleEditWork} />}
                  {currentPage === 'workEdit'        && <WorkEditPage        work={works.find((item) => item.id === activeWorkId) ?? null} onCancel={() => navigate('myWorks')} onSave={handleWorkTitleSave} />}
                  {currentPage === 'avatarManage'    && <AvatarManagePage    navigate={navigate} avatars={avatars} activeAvatarId={activeAvatarId} />}
                  {currentPage === 'evolutionReport' && <EvolutionReportPage navigate={navigate} />}
                  {currentPage === 'calibration'     && <CalibrationPage     navigate={navigate} avatar={avatars.find((item) => item.id === activeAvatarId) ?? avatars[0]} onAvatarUpdated={handleAvatarUpdated} />}
                  {currentPage === 'contribution'    && <ContributionPage    navigate={navigate} works={works} activeWorkId={activeWorkId} />}
                  {currentPage === 'billing'         && <BillingPage         billing={billing} onPeriodChange={handlePeriodChange} onUpgradePlan={handleUpgradePlan} />}
                </>
              }
          </main>

          <BottomPlayer currentWork={playingWork} queue={works} playing={isPlaying} onTogglePlay={() => setIsPlaying((playing) => !playing)} />
        </div>
      </div>
    </>
  );
}
