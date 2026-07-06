// Operations Command Center page: live crowd density, incidents,
// sustainability metrics and an on-demand AI briefing.
import { ErrorMessage, LoadingState } from '../../components/StatusMessage.js';
import { BriefingPanel } from './BriefingPanel.js';
import { DensityBoard } from './DensityBoard.js';
import { IncidentList } from './IncidentList.js';
import { SustainabilityMeters } from './SustainabilityMeters.js';
import { useOperations } from './useOperations.js';

/** Full operations command center route. */
export function OperationsPage(): React.JSX.Element {
  const { snapshot, snapshotError, briefing, isBriefingLoading, briefingError, generateBriefing } =
    useOperations();

  return (
    <section aria-labelledby="operations-heading" className="stack">
      <div>
        <h1 id="operations-heading">Operations Command Center</h1>
        <p className="page-intro">
          Live operational intelligence for Estadio Azteca — zone crowd density, open incidents and
          sustainability performance, refreshed automatically.
        </p>
      </div>

      {snapshotError !== null ? <ErrorMessage message={snapshotError} /> : null}
      {snapshot === null && snapshotError === null ? (
        <LoadingState label="Loading live operations data…" />
      ) : null}

      {snapshot !== null ? (
        <>
          <div className="grid-two">
            <div className="card">
              <h2>Zone crowd density</h2>
              <DensityBoard zones={snapshot.zones} />
            </div>
            <div className="card">
              <h2>Incidents</h2>
              <IncidentList incidents={snapshot.incidents} />
            </div>
          </div>

          <div className="card">
            <h2>Sustainability</h2>
            <SustainabilityMeters metrics={snapshot.sustainability} />
          </div>

          <BriefingPanel
            briefing={briefing}
            isLoading={isBriefingLoading}
            error={briefingError}
            onGenerate={() => {
              void generateBriefing();
            }}
          />
        </>
      ) : null}
    </section>
  );
}
