import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Ban, CheckCircle, Trash2, Users } from "lucide-react";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { adminService } from "../../services";

const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    adminService.users({ search: search || undefined, page, limit: LIMIT })
      .then((r) => { setUsers(r.data); setTotal(r.pagination?.total || 0); })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = async (id, name, blocked) => {
    await adminService.toggleBlockUser(id);
    toast.success(`${name} ${blocked ? "unblocked" : "blocked"}`);
    load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await adminService.deleteUser(id);
    toast.success("User deleted");
    load();
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Users</h1>
          <p className="text-sm text-[#64748B]">{total} registered customers</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email…" className="input-field !w-64 !py-2 pl-9 text-sm" />
        </div>
      </div>

      {loading ? <Loader fullScreen /> : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try adjusting your search." />
      ) : (
        <>
          <div className="card-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Addresses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-bold text-white text-sm">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#0F172A]">{u.name}</p>
                          <p className="text-xs text-[#94A3B8]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{u.phone || "—"}</td>
                    <td className="px-4 py-3 text-[#64748B]">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-[#64748B]">{u.addresses?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.isBlocked ? "bg-[#EF44441A] text-[#EF4444]" : "bg-[#22C55E1A] text-[#22C55E]"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button title={u.isBlocked ? "Unblock" : "Block"}
                        onClick={() => toggleBlock(u._id, u.name, u.isBlocked)}
                        className="mr-2 rounded-lg p-1.5 hover:bg-[#F8FAFC]">
                        {u.isBlocked
                          ? <CheckCircle size={16} className="text-[#22C55E]" />
                          : <Ban size={16} className="text-[#F97316]" />}
                      </button>
                      <button onClick={() => handleDelete(u._id, u.name)} className="rounded-lg p-1.5 text-[#EF4444] hover:bg-[#EF44441A]">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="mt-5 flex justify-center gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`h-9 w-9 rounded-xl text-sm font-semibold ${p === page ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B]"}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsers;
