import { Button } from "../ui/Button";
import { NodeGraph } from "../ui/NodeGraph";
import { Panel } from "../ui/Panel";

const loopNodes = ["灵感", "分身", "Demo", "发布", "二创", "收益", "分身成长"];

export function IndustryLoop() {
  return (
    <Panel className="industryLoop" aria-labelledby="industry-loop-title" tone="hero">
      <div className="panelHeader">
        <p className="eyebrow">Industry Loop</p>
        <h2 id="industry-loop-title">创作会在系统里持续回流</h2>
      </div>
      <NodeGraph
        ariaLabel="MuseGrid 创作循环"
        items={loopNodes.map((node, index) => ({
          id: node,
          title: node,
          meta: String(index + 1).padStart(2, "0"),
        }))}
      />
      <Button className="creatorEntry" href="/become-creator">
        成为创作人
      </Button>
    </Panel>
  );
}
