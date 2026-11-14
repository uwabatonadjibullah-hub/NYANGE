import { Alert } from '../../components/ui';
import { listAudit } from '../api';
import { formatDate, useLoad } from '../context';

export default function ActivityPage() {
  const { data, error, loading } = useLoad(() => listAudit(), []);
  return (
    <div>
      <h1 className="font-serif text-3xl">Activity log</h1>
      <p className="mt-1 text-muted">Every administrator action, newest first. Entries cannot be edited or deleted.</p>
      {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
      {loading && <p role="status" className="mt-4 text-muted">Loading…</p>}
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[40rem] text-left">
          <thead className="bg-mint-soft">
            <tr>
              <th scope="col" className="px-3 py-2">When</th>
              <th scope="col" className="px-3 py-2">Who</th>
              <th scope="col" className="px-3 py-2">Action</th>
              <th scope="col" className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap px-3 py-2 text-sm">{formatDate(e.at)}</td>
                <td className="px-3 py-2 text-sm">{e.actorEmail}</td>
                <td className="px-3 py-2 font-mono text-sm">{e.action}</td>
                <td className="px-3 py-2">{e.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
