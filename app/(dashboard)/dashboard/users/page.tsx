"use client";
import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { MOCK_USERS, MOCK_TRANSACTIONS } from "@/lib/mockData";
import { format } from "date-fns";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Plus, X, UserX, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from "xlsx";
import DataTable from "@/components/tables/DataTable";
import Pagination from "@/components/tables/Pagination";
import TableFilters from "@/components/tables/TableFilters";
import SkeletonTable from "@/components/ui/SkeletonTable";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Badge, { planVariant, statusVariant } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

type User = {
  _id: string; name: string; email: string; avatar: string;
  role: string; plan: string; status: string; country: string;
  city: string; revenue: number; joinedAt: string; lastActiveAt: string;
};

type Transaction = {
  _id: string; amount: number; plan: string; status: string; date: string; description: string;
};

const addSchema = z.object({
  name:    z.string().min(2, "Name is required"),
  email:   z.string().email("Invalid email"),
  plan:    z.enum(["free","pro","enterprise"]),
  role:    z.enum(["admin","user","viewer"]),
  status:  z.enum(["active","inactive","banned"]),
  country: z.string().optional(),
  city:    z.string().optional(),
});
type AddForm = z.infer<typeof addSchema>;

export default function UsersPage() {
  const [allUsers, setAllUsers]           = useState<User[]>(() => MOCK_USERS as User[]);
  const [page, setPage]                   = useState(1);
  const [search, setSearch]               = useState("");
  const [plan, setPlan]                   = useState("");
  const [status, setStatus]               = useState("");
  const [loading, setLoading]             = useState(true);
  const [rowSelection, setRowSelection]   = useState<RowSelectionState>({});
  const [drawerUser, setDrawerUser]       = useState<(User & { transactions?: Transaction[] }) | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [addOpen, setAddOpen]             = useState(false);
  const [addLoading, setAddLoading]       = useState(false);
  const [deleteId, setDeleteId]           = useState<string | null>(null);
  const [editUser, setEditUser]           = useState<User | null>(null);
  const [editLoading, setEditLoading]     = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { register: editRegister, handleSubmit: editHandleSubmit, reset: editReset, formState: { errors: editErrors } } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { plan: "free", role: "user", status: "active" },
  });

  useEffect(() => {
    setPortalMounted(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch, plan, status]);

  const filteredUsers = useMemo(() => allUsers.filter((u) => {
    const q = debouncedSearch.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    if (plan   && u.plan   !== plan)   return false;
    if (status && u.status !== status) return false;
    return true;
  }), [allUsers, debouncedSearch, plan, status]);

  const total      = filteredUsers.length;
  const totalPages = Math.ceil(total / 10) || 1;
  const users      = useMemo(() => filteredUsers.slice((page - 1) * 10, page * 10), [filteredUsers, page]);

  const openDrawer = (user: User) => {
    setDrawerUser(user);
    setDrawerLoading(true);
    setTimeout(() => {
      const idx  = allUsers.findIndex((u) => u._id === user._id);
      const txs  = MOCK_TRANSACTIONS.filter((_, i) => i % 7 === idx % 7).slice(0, 4) as Transaction[];
      setDrawerUser({ ...user, transactions: txs });
      setDrawerLoading(false);
    }, 250);
  };

  const handleDelete = (id: string) => {
    setAllUsers((prev) => prev.filter((u) => u._id !== id));
    toast.success("User deleted");
    setDeleteId(null);
    if (drawerUser?._id === id) setDrawerUser(null);
  };

  const handleBulkDelete = () => {
    const ids = new Set(Object.keys(rowSelection));
    if (!ids.size) return;
    setAllUsers((prev) => prev.filter((u) => !ids.has(u._id)));
    toast.success(`${ids.size} user(s) deleted`);
    setRowSelection({});
  };

  const handleAdd = (data: AddForm) => {
    setAddLoading(true);
    setTimeout(() => {
      const newUser: User = {
        _id: `mock_user_${Date.now()}`,
        name: data.name,
        email: data.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=6366f1&color=fff`,
        role: data.role,
        plan: data.plan,
        status: data.status,
        country: data.country ?? "",
        city: data.city ?? "",
        revenue: 0,
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      setAllUsers((prev) => [newUser, ...prev]);
      toast.success("User created");
      setAddOpen(false);
      reset();
      setAddLoading(false);
    }, 400);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(users.map((u) => ({
      Name: u.name, Email: u.email, Plan: u.plan, Status: u.status,
      Country: u.country, Revenue: u.revenue, Joined: format(new Date(u.joinedAt), "yyyy-MM-dd"),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users-export.xlsx");
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    editReset({
      name:    user.name,
      email:   user.email,
      plan:    user.plan    as AddForm["plan"],
      role:    user.role    as AddForm["role"],
      status:  user.status  as AddForm["status"],
      country: user.country ?? "",
      city:    user.city    ?? "",
    });
  };

  const handleEdit = (data: AddForm) => {
    if (!editUser) return;
    setEditLoading(true);
    setTimeout(() => {
      setAllUsers((prev) => prev.map((u) =>
        u._id === editUser._id
          ? { ...u, name: data.name, email: data.email, plan: data.plan, role: data.role,
              status: data.status, country: data.country ?? "", city: data.city ?? "" }
          : u
      ));
      toast.success("User updated");
      setEditUser(null);
      editReset();
      setEditLoading(false);
    }, 400);
  };

  const selectedCount = Object.keys(rowSelection).length;

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input type="checkbox" className="rounded border-slate-300"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e: ChangeEvent<HTMLInputElement>) => table.toggleAllPageRowsSelected(e.target.checked)} />
      ),
      cell: ({ row }) => (
        <input type="checkbox" className="rounded border-slate-300"
          checked={row.getIsSelected()}
          onChange={(e: ChangeEvent<HTMLInputElement>) => row.toggleSelected(e.target.checked)}
          onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row: { original: u } }) => (
        <div className="flex items-center gap-2.5">
          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-[var(--foreground)] truncate">{u.name}</p>
            <p className="text-xs text-[var(--muted)] truncate">{u.role}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-[var(--muted)]">{getValue() as string}</span> },
    { accessorKey: "plan",   header: "Plan",   cell: ({ getValue }) => <Badge variant={planVariant(getValue() as string)}>{getValue() as string}</Badge> },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <Badge variant={statusVariant(getValue() as string)}>{getValue() as string}</Badge> },
    { accessorKey: "country", header: "Country", cell: ({ getValue }) => <span className="text-[var(--muted)]">{getValue() as string}</span> },
    { accessorKey: "revenue", header: "Revenue", enableSorting: true, cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue() as number)}</span> },
    { accessorKey: "joinedAt", header: "Joined", enableSorting: true, cell: ({ getValue }) => <span className="text-[var(--muted)]">{format(new Date(getValue() as string), "MMM d, yyyy")}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row: { original: u } }) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openDrawer(u)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted)] hover:text-indigo-600 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted)] hover:text-amber-500 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(u._id)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted)] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  const editField = (label: string, name: keyof AddForm, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{label}</label>
      <input {...editRegister(name)} type={type}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      {editErrors[name] && <p className="mt-1 text-xs text-red-500">{editErrors[name]?.message}</p>}
    </div>
  );

  const editSel = (label: string, name: keyof AddForm, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{label}</label>
      <select {...editRegister(name)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const field = (label: string, name: keyof AddForm, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{label}</label>
      <input {...register(name)} type={type}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]?.message}</p>}
    </div>
  );

  const sel = (label: string, name: keyof AddForm, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{label}</label>
      <select {...register(name)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Users</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{total} total users</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCount > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors">
              <UserX className="w-4 h-4" /> Delete {selectedCount}
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Export Excel
          </button>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
        <TableFilters
          search={search} onSearchChange={setSearch} searchPlaceholder="Search name or email…"
          filters={[
            { id: "plan", placeholder: "All Plans", value: plan, onChange: setPlan, options: ["free","pro","enterprise"].map((v) => ({ label: v, value: v })) },
            { id: "status", placeholder: "All Statuses", value: status, onChange: setStatus, options: ["active","inactive","banned"].map((v) => ({ label: v, value: v })) },
          ]}
        />
        {loading ? <SkeletonTable rows={10} cols={9} /> : (
          <DataTable
            data={users} columns={columns} getRowId={(u) => u._id}
            rowSelection={rowSelection} onRowSelectionChange={setRowSelection}
            onRowClick={openDrawer}
            emptyNode={
              <EmptyState
                icon={<Users className="w-6 h-6" />}
                title="No users found"
                description={debouncedSearch || plan || status ? "Try adjusting your search or filters." : "Add your first user to get started."}
                action={
                  <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                    <Plus className="w-4 h-4" /> Add User
                  </button>
                }
              />
            }
          />
        )}
        <Pagination page={page} totalPages={totalPages} totalCount={total} limit={10} onPageChange={setPage} />
      </div>

      {/* Side drawer — rendered via portal to escape Framer Motion stacking context */}
      {portalMounted && createPortal(
        <AnimatePresence>
          {drawerUser && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-[150]" onClick={() => setDrawerUser(null)} />
              <motion.aside
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border)] z-[160] overflow-y-auto shadow-2xl"
              >
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <h2 className="font-semibold text-[var(--foreground)]">User Details</h2>
                <button onClick={() => setDrawerUser(null)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4 text-[var(--muted)]" />
                </button>
              </div>

              {drawerLoading ? (
                <div className="p-5 space-y-3 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />)}
                </div>
              ) : (
                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-4">
                    <img src={drawerUser.avatar} alt="" className="w-16 h-16 rounded-full" />
                    <div>
                      <p className="font-bold text-lg text-[var(--foreground)]">{drawerUser.name}</p>
                      <p className="text-sm text-[var(--muted)]">{drawerUser.email}</p>
                      <div className="flex gap-2 mt-1.5">
                        <Badge variant={planVariant(drawerUser.plan)}>{drawerUser.plan}</Badge>
                        <Badge variant={statusVariant(drawerUser.status)}>{drawerUser.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Role", drawerUser.role],
                      ["Country", `${drawerUser.city}, ${drawerUser.country}`],
                      ["Revenue", formatCurrency(drawerUser.revenue)],
                      ["Joined", format(new Date(drawerUser.joinedAt), "MMM d, yyyy")],
                      ["Last Active", format(new Date(drawerUser.lastActiveAt), "MMM d, yyyy")],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3">
                        <p className="text-[var(--muted)] text-xs mb-0.5">{k}</p>
                        <p className="font-medium text-[var(--foreground)] capitalize">{v}</p>
                      </div>
                    ))}
                  </div>

                  {drawerUser.transactions && drawerUser.transactions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--foreground)] mb-3">Recent Transactions</h3>
                      <div className="space-y-2">
                        {drawerUser.transactions.map((tx) => (
                          <div key={tx._id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                            <div>
                              <p className="text-sm font-medium text-[var(--foreground)]">{tx.description}</p>
                              <p className="text-xs text-[var(--muted)]">{format(new Date(tx.date), "MMM d, yyyy")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                              <span className="font-semibold text-sm">{formatCurrency(tx.amount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Add User modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); reset(); }}
        title="Add New User"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => { setAddOpen(false); reset(); }}
              className="flex-1 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" form="add-user-form" disabled={addLoading}
              className="flex-1 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50">
              {addLoading ? "Creating…" : "Create User"}
            </button>
          </div>
        }
      >
        <form id="add-user-form" onSubmit={handleSubmit(handleAdd)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field("Full Name", "name")}
            {field("Email", "email", "email")}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sel("Plan", "plan", ["free","pro","enterprise"])}
            {sel("Role", "role", ["admin","user","viewer"])}
            {sel("Status", "status", ["active","inactive","banned"])}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field("Country", "country")}
            {field("City", "city")}
          </div>
        </form>
      </Modal>

      {/* Confirm delete modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete User"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">Delete</button>
          </div>
        }
      >
        <p className="text-sm text-[var(--muted)]">This will permanently delete the user and all associated records. This action cannot be undone.</p>
      </Modal>

      {/* Edit User modal */}
      <Modal
        open={!!editUser}
        onClose={() => { setEditUser(null); editReset(); }}
        title="Edit User"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => { setEditUser(null); editReset(); }}
              className="flex-1 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" form="edit-user-form" disabled={editLoading}
              className="flex-1 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50">
              {editLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        }
      >
        <form id="edit-user-form" onSubmit={editHandleSubmit(handleEdit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {editField("Full Name", "name")}
            {editField("Email", "email", "email")}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {editSel("Plan", "plan", ["free","pro","enterprise"])}
            {editSel("Role", "role", ["admin","user","viewer"])}
            {editSel("Status", "status", ["active","inactive","banned"])}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {editField("Country", "country")}
            {editField("City", "city")}
          </div>
        </form>
      </Modal>
    </div>
  );
}
