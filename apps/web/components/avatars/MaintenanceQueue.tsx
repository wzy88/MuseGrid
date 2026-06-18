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
    <section className="studioPanel maintenanceQueue" aria-labelledby="maintenance-queue-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">Maintenance Queue</p>
          <h3 id="maintenance-queue-title">维护队列</h3>
        </div>
        <span className="studioPill">需创作人处理</span>
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
            <small>{task.status}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
