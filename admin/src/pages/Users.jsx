import { useEffect, useState } from 'react';
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trash2,
  Unlock,
  UserRound,
} from 'lucide-react';
import { api } from '../api.js';
import { ago, initials } from '../lib.js';
import { useAdmin } from '../admin-context.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';

const PER = 10;

export default function Users() {
  const { search, refreshKey, refreshSilent } = useAdmin();
  const { user: me } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [role, setRole] = useState('');
  const [blocked, setBlocked] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    setPage(1);
  }, [search, role, blocked]);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .users({ search, role, blocked })
      .then((d) => setItems(d.items || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, role, blocked, refreshKey]);

  const pages = Math.max(1, Math.ceil(items.length / PER));
  const safePage = Math.min(page, pages);
  const rows = items.slice((safePage - 1) * PER, safePage * PER);

  async function act(id, body, ok) {
    setBusy(id);
    try {
      await api.updateUser(id, body);
      toast(ok);
      refreshSilent();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy('');
    }
  }

  async function remove(user) {
    if (!window.confirm(`Delete ${user.email}? This removes their reports and cannot be undone.`)) return;
    setBusy(user.id);
    try {
      await api.deleteUser(user.id);
      toast('User deleted');
      refreshSilent();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <div className="toolbar">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <select value={blocked} onChange={(e) => setBlocked(e.target.value)}>
          <option value="">All statuses</option>
          <option value="0">Active</option>
          <option value="1">Blocked</option>
        </select>
        <span className="sp" />
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {items.length} accounts
        </span>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Reports</th>
              <th>Joined</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="loading">
                  Loading users…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((u) => {
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
                const mine = u.id === me?.id;
                return (
                  <tr key={u.id} className="no-click">
                    <td>
                      <div className="user-cell">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" /> : <div className="av">{initials(name)}</div>}
                        <div className="biz">
                          <strong>{name}</strong>
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-pill ${u.role}`}>{u.role}</span>
                    </td>
                    <td className="mono">
                      {u.completed_count || 0}
                      <span style={{ color: 'var(--text-3)' }}> / {u.reports_count || 0}</span>
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {ago(u.created_at)}
                    </td>
                    <td>
                      {u.blocked ? <span className="badge failed">Blocked</span> : <span className="badge completed">Active</span>}
                    </td>
                    <td>
                      <div className="row-actions">
                        {u.role !== 'admin' ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            disabled={busy === u.id}
                            onClick={() => act(u.id, { role: 'admin' }, 'Promoted to admin')}
                          >
                            <ShieldCheck className="lucide" /> Admin
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            disabled={mine || busy === u.id}
                            onClick={() => act(u.id, { role: 'user' }, 'Role set to user')}
                          >
                            <UserRound className="lucide" /> User
                          </button>
                        )}
                        {u.blocked ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            disabled={busy === u.id}
                            onClick={() => act(u.id, { blocked: false }, 'User unblocked')}
                          >
                            <Unlock className="lucide" /> Unblock
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            disabled={mine || busy === u.id}
                            onClick={() => act(u.id, { blocked: true }, 'User blocked')}
                          >
                            <Ban className="lucide" /> Block
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          type="button"
                          disabled={mine || busy === u.id}
                          onClick={() => remove(u)}
                        >
                          <Trash2 className="lucide" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            {!loading && !rows.length && (
              <tr>
                <td colSpan={6} className="empty">
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <span>
          Page {safePage} of {pages}
        </span>
        <div>
          <button className="btn btn-ghost btn-sm" type="button" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="lucide" />
          </button>
          <button className="btn btn-ghost btn-sm" type="button" disabled={safePage >= pages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="lucide" />
          </button>
        </div>
      </div>
    </>
  );
}
