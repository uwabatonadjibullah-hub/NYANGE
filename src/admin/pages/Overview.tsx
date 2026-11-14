import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/ui';
import { findDataIssues } from '../../lib/genealogy';
import { useRegistry } from '../../lib/registry';
import { listReview } from '../api';
import { can } from '../auth';
import { useLoad, useSession } from '../context';

export default function Overview() {
  const session = useSession();
  const { index, fromSeed } = useRegistry();
  const { data, error } = useLoad(async () => {
    const [claims, notices, messages] = await Promise.all([listReview('submissions'), listReview('notifications'), listReview('messages')]);
    const pending = (l: { status: string }[]) => l.filter((i) => i.status === 'pending').length;
    return { claims: pending(claims), notices: pending(notices), messages: pending(messages) };
  });
  const issues = findDataIssues(index);

  const cards = [
    { to: '/admin/claims', label: 'Children claims waiting', n: data?.claims },
    { to: '/admin/notices', label: 'Record Me notices waiting', n: data?.notices },
    { to: '/admin/messages', label: 'Unread messages', n: data?.messages },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Welcome</h1>
        <p className="text-muted">Signed in as {session.email} ({session.role}).</p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {fromSeed && can.edit(session.role) && (
        <Alert tone="info">
          The family registry has not been imported into the database yet, so the website is showing the bundled census-report data.{' '}
          <Link to="/admin/registry" className="font-semibold underline">Import it in Family registry</Link> before approving claims.
        </Alert>
      )}
      <ul className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li key={c.to}>
            <Link to={c.to} className="flex h-full flex-col rounded-lg border border-line bg-white p-5 hover:border-primary">
              <span className="font-serif text-4xl text-primary">{c.n ?? '…'}</span>
              <span className="mt-1">{c.label}</span>
              <span className="mt-3 inline-flex items-center gap-1 font-semibold text-primary">Open <ArrowRight className="h-4 w-4" aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="font-serif text-2xl">Family registry</h2>
        <p className="mt-1">{index.all.length} records · {index.all.filter((p) => p.status === 'verified').length} confirmed by the family</p>
        {issues.length > 0 && (
          <div className="mt-4">
            <p className="flex items-center gap-2 font-semibold text-pending"><AlertTriangle className="h-5 w-5" aria-hidden /> {issues.length} data checks need the family’s attention</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {issues.slice(0, 8).map((i, k) => (
                <li key={k}><strong>{index.byId.get(i.personId)?.fullName ?? i.personId}</strong>: {i.detail}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
