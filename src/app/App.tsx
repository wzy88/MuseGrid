import { useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { Sidebar, type Page } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomPlayer } from './components/layout/BottomPlayer';
import { HomePage } from './components/pages/HomePage';
import { ProductionPage } from './components/pages/ProductionPage';
import { AvatarNetworkPage } from './components/pages/AvatarNetworkPage';
import { CreateAvatarPage } from './components/pages/CreateAvatarPage';
import { MyWorksPage } from './components/pages/MyWorksPage';
import { AvatarManagePage } from './components/pages/AvatarManagePage';
import { EvolutionReportPage } from './components/pages/EvolutionReportPage';
import { CalibrationPage } from './components/pages/CalibrationPage';
import { ContributionPage } from './components/pages/ContributionPage';
import { DesignSystemPage } from './components/pages/DesignSystemPage';
import { LayoutGrid, Package } from 'lucide-react';
import { C } from './design/tokens';
import { HandoffPage } from './components/pages/HandoffPage';
import {
  DEFAULT_PROJECT,
  SAMPLE_WORKS,
  buildProjectFromIdea,
  createSteps,
  generatedWorkFromProject,
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

export default function App() {
  const store = useMemo(() => createMuseGridStore(), []);
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
  const [calibrations, setCalibrations] = useState<AvatarCalibration[]>([]);
  const [works, setWorks] = useState<GeneratedWork[]>(SAMPLE_WORKS);
  const [activeWorkId, setActiveWorkId] = useState<number | null>(null);
  const didHydrate = useRef(false);

  const navigate = (page: Page) => { setCurrentPage(page); setShowDS(false); setShowHandoff(false); };

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const currentUser = await store.getCurrentUser();
        const snapshot = await store.loadSnapshot(currentUser?.id);
        if (cancelled) return;
        setUser(currentUser);
        setProject(snapshot.project);
        setSteps(snapshot.steps);
        setCurrentStep(snapshot.currentStep);
        setContributions(snapshot.contributions);
        setAvatars(snapshot.avatars);
        setActiveAvatarId(snapshot.activeAvatarId);
        setWorks(snapshot.works);
        setActiveWorkId(snapshot.activeWorkId);
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
          return [...byId.values()].map(normalizeAvatar);
        });
        setActiveAvatarId((current) => current ?? cloudAvatars[0]?.id ?? null);
      })
      .catch((error) => {
        console.info('avatar cloud load skipped', error);
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
      updatedAt: new Date().toISOString(),
    }, user?.id).catch((error) => {
      console.error(error);
    });
  }, [activeAvatarId, activeWorkId, avatars, contributions, currentStep, project, steps, store, user?.id, works]);

  function startProjectFromIdea(idea: string) {
    const nextProject = buildProjectFromIdea(idea);
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
  }

  function handleAvatarCreated(avatar: AvatarProfile) {
    const normalized = normalizeAvatar(avatar);
    setAvatars((current) => [normalized, ...current.filter((item) => item.id !== normalized.id)]);
    setActiveAvatarId(normalized.id);
  }

  function handleAvatarUpdated(avatar: AvatarProfile, calibration?: AvatarCalibration) {
    const normalized = normalizeAvatar(avatar);
    setAvatars((current) => current.map((item) => item.id === normalized.id ? normalized : item));
    setActiveAvatarId(normalized.id);
    if (calibration) {
      setCalibrations((current) => [calibration, ...current.filter((item) => item.id !== calibration.id)]);
    }
  }

  return (
    <>
      {/* Toaster for action feedback */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(14,16,28,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.92)',
            borderRadius: 12,
          },
        }}
        richColors
      />

      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: C.bg0,
        fontFamily: "'Noto Sans SC','PingFang SC','Inter',sans-serif",
        position: 'relative',
      }}>
        <Sidebar currentPage={currentPage} navigate={navigate} />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
          {/* Top bar + design system toggle */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <TopBar user={user} storeMode={store.mode} booting={booting} />
            </div>
            <button
              onClick={() => setShowDS(v => !v)}
              style={{
                height: 52,
                padding: '0 16px',
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
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
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
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
                  {currentPage === 'production'      && <ProductionPage      navigate={navigate} project={project} steps={steps} setSteps={setSteps} current={currentStep} setCurrent={setCurrentStep} contributions={contributions} setContributions={setContributions} onDemoGenerated={handleDemoGenerated} avatars={avatars} />}
                  {currentPage === 'avatarNetwork'   && <AvatarNetworkPage   navigate={navigate} avatars={avatars} />}
                  {currentPage === 'createAvatar'    && <CreateAvatarPage    navigate={navigate} onAvatarCreated={handleAvatarCreated} />}
                  {currentPage === 'myWorks'         && <MyWorksPage         navigate={navigate} works={works} activeWorkId={activeWorkId} />}
                  {currentPage === 'avatarManage'    && <AvatarManagePage    navigate={navigate} avatars={avatars} activeAvatarId={activeAvatarId} />}
                  {currentPage === 'evolutionReport' && <EvolutionReportPage navigate={navigate} />}
                  {currentPage === 'calibration'     && <CalibrationPage     navigate={navigate} avatar={avatars.find((item) => item.id === activeAvatarId) ?? avatars[0]} onAvatarUpdated={handleAvatarUpdated} />}
                  {currentPage === 'contribution'    && <ContributionPage    navigate={navigate} works={works} activeWorkId={activeWorkId} />}
                </>
              }
          </main>

          <BottomPlayer />
        </div>
      </div>
    </>
  );
}
