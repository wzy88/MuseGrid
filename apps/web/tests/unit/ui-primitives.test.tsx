import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Button } from "../../components/ui/Button";
import { ProgressTrack } from "../../components/ui/ProgressTrack";

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

describe("visual primitive rollout", () => {
  it("keeps the work detail page on shared panels and status badges", () => {
    const source = readFileSync(resolve(process.cwd(), "app/works/[projectId]/page.tsx"), "utf8");

    expect(source).toContain('from "../../../components/ui/Panel"');
    expect(source).toContain('from "../../../components/ui/StatusBadge"');
    expect(source).not.toContain('<section className="studioPanel');
    expect(source).not.toContain('<span className="studioPill');
  });
});
