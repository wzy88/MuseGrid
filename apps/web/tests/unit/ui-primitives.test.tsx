import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ContributionChain } from "../../components/contribution/ContributionChain";
import { AvatarSelector } from "../../components/avatars/AvatarSelector";
import { CreatorDirectionStep } from "../../components/creator-onboarding/CreatorDirectionStep";
import { ProjectBriefField } from "../../components/studio/ProjectBriefField";
import { NewProjectPanel } from "../../components/studio/NewProjectPanel";
import { ProductionStepRail } from "../../components/studio/ProductionStepRail";
import { StepWorkspace } from "../../components/studio/StepWorkspace";
import { Button } from "../../components/ui/Button";
import { ProgressTrack } from "../../components/ui/ProgressTrack";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("Button", () => {
  it("renders loading links as disabled and non-interactive", () => {
    const onClick = vi.fn();
    const element = Button({
      children: "查看详情",
      href: "/works/demo",
      loading: true,
      onClick,
    });

    expect(element.type).toBe("a");
    expect(element.props["aria-busy"]).toBe(true);
    expect(element.props["aria-disabled"]).toBe(true);
    expect(element.props.tabIndex).toBe(-1);
    expect(element.props.href).toBeUndefined();

    const event = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    element.props.onClick(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("ProgressTrack", () => {
  it("supports clickable steps without bespoke wrappers", () => {
    const onSelectStep = vi.fn();
    const element = ProgressTrack({
      ariaLabel: "制作链路状态",
      steps: [
        {
          id: "lyrics",
          label: "作词",
          statusLabel: "当前步骤",
          state: "active",
          caption: "写出叙事与副歌记忆点",
          onSelect: () => onSelectStep("lyrics"),
        },
        {
          id: "composition",
          label: "作曲",
          statusLabel: "待解锁",
          state: "locked",
          caption: "搭建旋律与段落结构",
          disabled: true,
        },
      ],
    });

    expect(element.props.className).toContain("mgProgressTrack--interactive");

    const [activeStep, lockedStep] = element.props.children;

    expect(activeStep.props.children.type).toBe("button");
    expect(activeStep.props.children.props.type).toBe("button");
    expect(activeStep.props.children.props["aria-pressed"]).toBe(true);
    expect(activeStep.props.children.props.disabled).toBeUndefined();
    expect(activeStep.props.children.props.children[1].props.children[2].props.children).toBe("写出叙事与副歌记忆点");

    activeStep.props.children.props.onClick();
    expect(onSelectStep).toHaveBeenCalledWith("lyrics");

    expect(lockedStep.props.className).toContain("mgProgressTrack__item--locked");
  });
});

describe("NewProjectPanel", () => {
  it("makes quick and professional studio modes visible before project creation", () => {
    const rendered = renderToStaticMarkup(<NewProjectPanel />);

    expect(rendered).toContain("创作台模式");
    expect(rendered).toContain("极速模式");
    expect(rendered).toContain("专业模式");
    expect(rendered).toContain("当前模式：专业模式");
    expect(rendered).toContain("studioEntryModeStatus");
    expect(rendered).toContain("modeSelectedBadge");
  });
});

describe("CreatorDirectionStep", () => {
  it("selects a capability when the visible card is clicked", () => {
    const onChange = vi.fn();
    const element = CreatorDirectionStep({ value: "", onChange });
    const grid = element.props.children[1];
    const [lyricsCard] = grid.props.children;

    lyricsCard.props.onClick();

    expect(onChange).toHaveBeenCalledWith("lyrics");
  });

  it("supports arrow-key movement across creator directions", () => {
    const onChange = vi.fn();
    const element = CreatorDirectionStep({ value: "lyrics", onChange });
    const grid = element.props.children[1];
    const [lyricsCard] = grid.props.children;
    const event = {
      key: "ArrowRight",
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    lyricsCard.props.onKeyDown(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onChange).toHaveBeenCalledWith("composition");
  });
});

describe("ContributionChain", () => {
  it("labels self-written contributions as user-authored work", () => {
    const element = ContributionChain({
      avatarsById: {},
      contributions: [
        {
          id: "contribution-self",
          stepType: "lyrics",
          avatarId: "self",
          avatarLevelAtTime: 1,
          outputSummary: "用户直接写入的歌词版本",
          contributionWeight: 25,
          createdAt: "2026-06-18T10:00:00.000Z",
        },
      ],
      hideSelectedAvatar: true,
    });

    const contributionPanel = element.props.children[1];
    const contributionList = contributionPanel.props.children[1];
    const [item] = contributionList.props.children;
    const renderedItem = JSON.stringify(item);

    expect(contributionList.props.className).toBe("compactContributionList");
    expect(renderedItem).toContain("本人创作");
    expect(renderedItem).toContain("Lv.1 / 25%");
    expect(renderedItem).not.toContain("用户直接写入的歌词版本");
  });

  it("keeps the sidebar contribution chain compact instead of repeating long summaries", () => {
    const element = ContributionChain({
      avatarsById: {
        "avatar-1": {
          id: "avatar-1",
          avatarName: "副歌钩子手",
          capabilityDirection: "lyrics",
          level: 3,
          styleTags: ["Hook"],
          intro: "擅长快速提炼副歌记忆点。",
          sampleOutputs: [],
          simulatedCallCount: 47,
          status: "seeded",
        },
      },
      contributions: [
        {
          id: "contribution-1",
          stepType: "lyrics",
          avatarId: "avatar-1",
          avatarLevelAtTime: 3,
          outputSummary: "激情燃烧的夏天，应该用什么音乐表现，以此为题来写一首歌。",
          contributionWeight: 25,
          createdAt: "2026-06-18T10:00:00.000Z",
        },
      ],
      hideSelectedAvatar: true,
      progressLabel: "1/4",
    });

    const rendered = JSON.stringify(element);

    expect(rendered).toContain("contributionChain compactContributionChain");
    expect(rendered).toContain("compactContributionList");
    expect(rendered).toContain("Lv.3 / 25%");
    expect(rendered).not.toContain("mgNodeGraph");
    expect(rendered).not.toContain("激情燃烧的夏天");
  });
});

describe("ProductionStepRail", () => {
  it("renders the studio step rail as a compact navigation rail", () => {
    const element = ProductionStepRail({
      activeStep: "production",
      unlockedSteps: new Set(["lyrics", "composition", "arrangement", "production"]),
      onSelectStep: vi.fn(),
      steps: [
        {
          id: "lyrics-step",
          projectId: "project-1",
          stepType: "lyrics",
          selectedAvatarId: null,
          inputPayload: {},
          outputPayload: null,
          userEdits: null,
          status: "completed",
        },
        {
          id: "production-step",
          projectId: "project-1",
          stepType: "production",
          selectedAvatarId: null,
          inputPayload: {},
          outputPayload: null,
          userEdits: null,
          status: "ready",
        },
      ],
    });

    const rendered = JSON.stringify(element);

    expect(rendered).toContain("productionStepRail compactStepRail");
    expect(rendered).toContain("进度");
    expect(rendered).not.toContain("四步创作链路");
  });
});

describe("AvatarSelector", () => {
  it("renders a visual avatar mark for each callable creator avatar", () => {
    const element = AvatarSelector({
      avatars: [
        {
          id: "avatar-1",
          avatarName: "夜航作词人",
          capabilityDirection: "lyrics",
          level: 2,
          styleTags: ["R&B", "中文"],
          intro: "擅长克制叙事。",
          sampleOutputs: [],
          simulatedCallCount: 18,
          status: "seeded",
        },
      ],
      currentStep: "lyrics",
      selectedAvatarId: null,
      onSelectAvatar: vi.fn(),
      isSaving: false,
      isLocked: false,
      error: "",
      compact: true,
    });

    const selectorList = element.props.children[0];
    const [avatarCard] = selectorList.props.children;
    const avatarVisual = avatarCard.props.children[1];

    expect(avatarVisual.props.className).toContain("avatarPortrait");
    expect(avatarVisual.props["aria-hidden"]).toBe(true);
    expect(avatarVisual.props.children).toBe("夜");
  });

  it("keeps compact avatar lists scannable by expanding details only on the selected avatar", () => {
    const element = AvatarSelector({
      avatars: [
        {
          id: "avatar-1",
          avatarName: "夜航作词人",
          capabilityDirection: "lyrics",
          level: 2,
          styleTags: ["R&B", "中文"],
          intro: "擅长克制叙事。",
          sampleOutputs: [],
          simulatedCallCount: 18,
          status: "seeded",
        },
        {
          id: "avatar-2",
          avatarName: "城市副歌手",
          capabilityDirection: "lyrics",
          level: 3,
          styleTags: ["流行", "Hook"],
          intro: "擅长把副歌写得更抓耳。",
          sampleOutputs: [],
          simulatedCallCount: 31,
          status: "seeded",
        },
      ],
      currentStep: "lyrics",
      selectedAvatarId: "avatar-2",
      onSelectAvatar: vi.fn(),
      isSaving: false,
      isLocked: false,
      error: "",
      compact: true,
    });

    const selectorList = element.props.children[0];
    const [unselectedCard, selectedCard] = selectorList.props.children;

    expect(JSON.stringify(unselectedCard)).not.toContain("适配作词阶段");
    expect(JSON.stringify(unselectedCard)).not.toContain("R&B");
    expect(JSON.stringify(selectedCard)).toContain("擅长把副歌写得更抓耳。");
    expect(JSON.stringify(selectedCard)).toContain("Hook");
  });
});

describe("ProjectBriefField", () => {
  it("lets users pick common brief values while keeping custom input available", () => {
    const onChange = vi.fn();
    const element = ProjectBriefField({
      label: "曲风",
      name: "genre",
      value: "Future R&B",
      options: ["流行", "Future Pop", "R&B"],
      onChange,
    });

    const rendered = JSON.stringify(element);
    expect(rendered).toContain("Future Pop");
    expect(rendered).toContain("自定义曲风");

    const presetList = element.props.children[1];
    const futurePopButton = presetList.props.children[1];
    futurePopButton.props.onClick();
    expect(onChange).toHaveBeenCalledWith("Future Pop");

    const input = element.props.children[2];
    input.props.onChange({ target: { value: "Neo Soul" } });
    expect(onChange).toHaveBeenCalledWith("Neo Soul");
  });
});

describe("StepWorkspace", () => {
  it("presents creation mode as a compact decision control and keeps the next action docked", () => {
    const element = StepWorkspace({
      step: {
        id: "step-lyrics",
        projectId: "project-1",
        stepType: "lyrics",
        selectedAvatarId: null,
        inputPayload: {},
        outputPayload: null,
        userEdits: null,
        status: "draft",
      },
      projectTitle: "界面减负",
      selectedAvatarName: null,
      statusMessage: "先选择创作方式。",
      error: "",
      isGenerating: false,
      isConfirming: false,
      isLocked: false,
      creationMode: "",
      selfDraft: "",
      generatedDraft: "",
      avatars: [],
      selectedAvatarId: null,
      isSelectingAvatar: false,
      avatarError: "",
      onModeChange: vi.fn(),
      onSelfDraftChange: vi.fn(),
      onGeneratedDraftChange: vi.fn(),
      onSelectAvatar: vi.fn(),
      onGenerate: vi.fn(),
      revisionNote: "",
      onRevisionNoteChange: vi.fn(),
      onRevise: vi.fn(),
      onConfirm: vi.fn(),
    });

    const rendered = JSON.stringify(element);

    expect(rendered).toContain("这一步你想怎么完成？");
    expect(rendered).toContain("creationModeSegmented");
    expect(rendered).toContain("modeSegmentButton");
    expect(rendered).toContain("choiceModePrompt");
    expect(rendered).not.toContain("1. 选择方式");
    expect(rendered).toContain("workspaceActionDock");
    expect(rendered).toContain("下一步操作");
  });

  it("shows an obvious selected-mode status after mode switching", () => {
    const element = StepWorkspace({
      step: {
        id: "step-lyrics",
        projectId: "project-1",
        stepType: "lyrics",
        selectedAvatarId: null,
        inputPayload: {},
        outputPayload: null,
        userEdits: null,
        status: "draft",
      },
      projectTitle: "模式切换",
      selectedAvatarName: null,
      statusMessage: "填写你的版本，确认后进入下一步。",
      error: "",
      isGenerating: false,
      isConfirming: false,
      isLocked: false,
      creationMode: "self",
      selfDraft: "",
      generatedDraft: "",
      avatars: [],
      selectedAvatarId: null,
      isSelectingAvatar: false,
      avatarError: "",
      onModeChange: vi.fn(),
      onSelfDraftChange: vi.fn(),
      onGeneratedDraftChange: vi.fn(),
      onSelectAvatar: vi.fn(),
      onGenerate: vi.fn(),
      revisionNote: "",
      onRevisionNoteChange: vi.fn(),
      onRevise: vi.fn(),
      onConfirm: vi.fn(),
    });

    const rendered = JSON.stringify(element);

    expect(rendered).toContain("modeSelectedBadge");
    expect(rendered).toContain("已选择");
    expect(rendered).toContain("creationModeStatus");
    expect(rendered).toContain("当前模式：");
    expect(rendered).toContain("自己写");
    expect(rendered).toContain("下方已切换到手写输入区");
  });

  it("frames avatar mode as focused creator-avatar cards with a marketplace entry", () => {
    const element = StepWorkspace({
      step: {
        id: "step-lyrics",
        projectId: "project-1",
        stepType: "lyrics",
        selectedAvatarId: "avatar-1",
        inputPayload: {},
        outputPayload: {
          fullLyricDraft: "这里是一版分身交付的歌词草案",
        },
        userEdits: null,
        status: "ready",
      },
      projectTitle: "召唤体验",
      selectedAvatarName: "夜航作词人",
      statusMessage: "已生成，可继续确认",
      error: "",
      isGenerating: false,
      isConfirming: false,
      isLocked: false,
      creationMode: "avatar",
      selfDraft: "",
      generatedDraft: "",
      avatars: [
        {
          id: "avatar-1",
          avatarName: "夜航作词人",
          capabilityDirection: "lyrics",
          level: 2,
          styleTags: ["R&B", "中文"],
          intro: "擅长克制叙事。",
          sampleOutputs: [],
          simulatedCallCount: 18,
          status: "seeded",
        },
      ],
      selectedAvatarId: "avatar-1",
      isSelectingAvatar: false,
      avatarError: "",
      onModeChange: vi.fn(),
      onSelfDraftChange: vi.fn(),
      onGeneratedDraftChange: vi.fn(),
      onSelectAvatar: vi.fn(),
      onGenerate: vi.fn(),
      revisionNote: "",
      onRevisionNoteChange: vi.fn(),
      onRevise: vi.fn(),
      onConfirm: vi.fn(),
    });

    const rendered = JSON.stringify(element);

    expect(rendered).toContain("最近召唤");
    expect(rendered).toContain("推荐创作人");
    expect(rendered).toContain("查看更多创作人");
    expect(rendered).toContain("召唤他作词");
    expect(rendered).toContain("修订工作区");
    expect(rendered).toContain("修改意见");
    expect(rendered).toContain("让分身继续修改");
    expect(rendered).toContain("满意后再确认进入下一步");
    expect(rendered).toContain("分身已交付");
    expect(rendered).toContain("继续召唤其他分身");
    expect(rendered).toContain("创建我的创作人分身，等待别人召唤");
    expect(rendered).not.toContain("召唤台");
    expect(rendered).not.toContain("选择分身 -> 发起召唤 -> 编辑交付草案");
    expect(rendered).not.toContain("模拟调用");
    expect(rendered).not.toContain("编辑结果");
  });

  it("emphasizes continuing revisions after direct draft edits and disables avatar comparison", () => {
    const element = StepWorkspace({
      step: {
        id: "step-lyrics",
        projectId: "project-1",
        stepType: "lyrics",
        selectedAvatarId: "avatar-1",
        inputPayload: {},
        outputPayload: {
          fullLyricDraft: "原始草案",
          sourceType: "avatar",
        },
        userEdits: null,
        status: "ready",
      },
      projectTitle: "雨夜列车",
      selectedAvatarName: "夜航作词人",
      statusMessage: "分身已交付草案，可编辑或确认。",
      error: "",
      isGenerating: false,
      isConfirming: false,
      isLocked: false,
      creationMode: "avatar",
      selfDraft: "",
      generatedDraft: "我直接改过的歌词草案",
      avatars: [
        {
          id: "avatar-1",
          avatarName: "夜航作词人",
          capabilityDirection: "lyrics",
          level: 2,
          styleTags: ["R&B", "中文"],
          intro: "擅长克制叙事。",
          sampleOutputs: [],
          simulatedCallCount: 18,
          status: "seeded",
        },
      ],
      selectedAvatarId: "avatar-1",
      isSelectingAvatar: false,
      avatarError: "",
      onModeChange: vi.fn(),
      onSelfDraftChange: vi.fn(),
      onGeneratedDraftChange: vi.fn(),
      onSelectAvatar: vi.fn(),
      onGenerate: vi.fn(),
      revisionNote: "",
      onRevisionNoteChange: vi.fn(),
      onRevise: vi.fn(),
      onConfirm: vi.fn(),
    });

    const rendered = JSON.stringify(element);

    expect(rendered).toContain("readyRevisionButton");
    expect(rendered).toContain("\"data-state\":\"ready\"");
    expect(rendered).toContain("选择对比分身");
    expect(rendered).toContain("对比分身将在后续版本开放");
  });

  it("keeps confirmation inside the active task panel instead of rendering a separate final panel", () => {
    const element = StepWorkspace({
      step: {
        id: "step-lyrics",
        projectId: "project-1",
        stepType: "lyrics",
        selectedAvatarId: null,
        inputPayload: {},
        outputPayload: null,
        userEdits: null,
        status: "draft",
      },
      projectTitle: "界面减负",
      selectedAvatarName: null,
      statusMessage: "填写你的版本，确认后进入下一步。",
      error: "",
      isGenerating: false,
      isConfirming: false,
      isLocked: false,
      creationMode: "self",
      selfDraft: "用户自己写好的歌词",
      generatedDraft: "",
      avatars: [],
      selectedAvatarId: null,
      isSelectingAvatar: false,
      avatarError: "",
      onModeChange: vi.fn(),
      onSelfDraftChange: vi.fn(),
      onGeneratedDraftChange: vi.fn(),
      onSelectAvatar: vi.fn(),
      onGenerate: vi.fn(),
      revisionNote: "",
      onRevisionNoteChange: vi.fn(),
      onRevise: vi.fn(),
      onConfirm: vi.fn(),
    });

    const rendered = JSON.stringify(element);

    expect(rendered).not.toContain("Final");
    expect(rendered).not.toContain("确认并进入下一步");
    expect(rendered).toContain("这一步你想怎么完成？");
    expect(rendered).not.toContain("1. 选择方式");
    expect(rendered).not.toContain("2. 填写或召唤");
    expect(rendered).not.toContain("3. 确认进入下一步");
    expect(rendered).toContain("确认作词成果，进入作曲");
  });
});
