import type { ReactNode } from "react";

type NodeGraphItem = {
  id: string;
  title: string;
  detail?: string;
  meta?: string;
};

type NodeGraphProps = {
  items: NodeGraphItem[];
  ariaLabel: string;
  renderVisual?: (item: NodeGraphItem, index: number) => ReactNode;
};

export function NodeGraph({ ariaLabel, items, renderVisual }: NodeGraphProps) {
  return (
    <ol className="mgNodeGraph" aria-label={ariaLabel}>
      {items.map((item, index) => (
        <li className="mgNodeGraph__item" key={item.id}>
          <span className="mgNodeGraph__rail" aria-hidden="true" />
          <span className="mgNodeGraph__visual" aria-hidden="true">
            {renderVisual ? renderVisual(item, index) : <span className="mgNodeGraph__pulse" />}
          </span>
          <div className="mgNodeGraph__body">
            <div className="mgNodeGraph__titleRow">
              <strong>{item.title}</strong>
              {item.meta ? <span>{item.meta}</span> : null}
            </div>
            {item.detail ? <p>{item.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
