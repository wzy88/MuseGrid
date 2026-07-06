import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

type MaintenanceTask = {
  title: string;
  detail: string;
  status: string;
};

type MaintenanceQueueProps = {
  tasks: MaintenanceTask[];
};

export function MaintenanceQueue({ tasks }: MaintenanceQueueProps) {
  return (
    <Panel className="studioPanel maintenanceQueue" aria-labelledby="maintenance-queue-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">Next Actions</p>
          <h3 id="maintenance-queue-title">下一步维护</h3>
        </div>
        <StatusBadge label="需创作人处理" tone="warning" />
      </div>

      <div className="maintenanceQueueList" role="list">
        {tasks.map((task, index) => (
          <article className="maintenanceTaskCard" key={task.title} role="listitem">
            <div className="maintenanceTaskTopline">
              <span className="maintenanceTaskIndex">{index + 1}</span>
              <div>
                <strong>{task.title}</strong>
                <p>{task.detail}</p>
              </div>
            </div>
            <div className="maintenanceTaskFooter">
              <small>{task.status}</small>
              <a className="maintenanceTaskAction" href="/avatar-dashboard" aria-label={`去处理${task.title}`}>
                去处理
              </a>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
