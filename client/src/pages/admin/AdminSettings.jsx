import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { User, Lock, Globe, Bell, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { userService, authService } from "../../services";

const TABS = [
  { id:"profile",  label:"Admin Profile",   icon: User   },
  { id:"password", label:"Change Password", icon: Lock   },
  { id:"site",     label:"Site Settings",   icon: Globe  },
  { id:"notif",    label:"Notifications",   icon: Bell   },
  { id:"security", label:"Security",        icon: Shield },
];

const AdminSettings = () => {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("profile");

  const profileForm  = useForm({ defaultValues: { name: user?.name, phone: user?.phone || "" } });
  const passwordForm = useForm();
  const siteForm     = useForm({ defaultValues: { siteName:"ShopEZ", tagline:"Shop Smarter. Live Better.", supportEmail:"support@shopez.com", currency:"INR", freeShippingThreshold:"999" } });

  const onSaveProfile = async (data) => {
    const res = await userService.updateProfile(data);
    const updated = { ...user, ...res.data };
    setUser(updated);
    localStorage.setItem("shopez_user", JSON.stringify(updated));
    toast.success("Profile updated ✓");
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) { toast.error("Passwords do not match"); return; }
    try {
      await authService.changePassword(data);
      toast.success("Password updated ✓");
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update password");
    }
  };

  const onSaveSite = (data) => toast.success("Site settings saved (UI demo)");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[#0F172A]">Settings</h1>
      <p className="text-sm text-[#64748B]">Manage your admin account and store preferences.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <div className="flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id ? "bg-[#2563EB] text-white" : "bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}>
              <t.icon size={15}/> {t.label}
            </button>
          ))}
        </div>

        <div className="card-surface p-6">
          {/* Admin Profile */}
          {tab === "profile" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Admin Profile</h3>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-display text-2xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-semibold text-[#0F172A]">{user?.name}</p>
                  <p className="text-sm text-[#64748B]">{user?.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-[#2563EB1A] px-2 py-0.5 text-xs font-semibold text-[#2563EB]">Super Admin</span>
                </div>
              </div>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="max-w-md space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Full Name</label>
                  <input {...profileForm.register("name", { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Phone</label>
                  <input {...profileForm.register("phone")} placeholder="+91 98765 43210" className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Email</label>
                  <input value={user?.email} disabled className="input-field cursor-not-allowed bg-[#F8FAFC] text-[#94A3B8]" />
                </div>
                <button className="btn-primary">Save Profile</button>
              </form>
            </div>
          )}

          {/* Change Password */}
          {tab === "password" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Change Password</h3>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="max-w-md space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Current Password</label>
                  <input type="password" {...passwordForm.register("currentPassword", { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">New Password</label>
                  <input type="password" {...passwordForm.register("newPassword", { required: true, minLength: 6 })} className="input-field" />
                  <p className="mt-1 text-xs text-[#94A3B8]">Minimum 6 characters</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Confirm New Password</label>
                  <input type="password" {...passwordForm.register("confirmPassword", { required: true })} className="input-field" />
                </div>
                <button className="btn-primary">Update Password</button>
              </form>
            </div>
          )}

          {/* Site Settings */}
          {tab === "site" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Site Settings</h3>
              <form onSubmit={siteForm.handleSubmit(onSaveSite)} className="max-w-md space-y-4">
                {[
                  { name:"siteName",              label:"Store Name" },
                  { name:"tagline",               label:"Tagline" },
                  { name:"supportEmail",          label:"Support Email" },
                  { name:"currency",              label:"Currency" },
                  { name:"freeShippingThreshold", label:"Free Shipping Threshold (₹)" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="mb-1 block text-sm font-medium text-[#0F172A]">{f.label}</label>
                    <input {...siteForm.register(f.name)} className="input-field" />
                  </div>
                ))}
                <button className="btn-primary">Save Settings</button>
              </form>
            </div>
          )}

          {/* Notifications */}
          {tab === "notif" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Admin Notifications</h3>
              <div className="max-w-md space-y-3">
                {[
                  { label:"New order alerts",       desc:"Get notified when a new order is placed" },
                  { label:"Low stock alerts",       desc:"Alert when product stock falls below 10" },
                  { label:"New user registrations", desc:"Notify when a new customer registers" },
                  { label:"Payment failures",       desc:"Alert on failed payment attempts" },
                  { label:"Review submitted",       desc:"Notify when a new review is posted" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{n.label}</p>
                      <p className="text-xs text-[#64748B]">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="peer h-6 w-11 rounded-full bg-[#E2E8F0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-[#2563EB] peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
                <button onClick={() => toast.success("Notification preferences saved")} className="btn-primary">Save Preferences</button>
              </div>
            </div>
          )}

          {/* Security */}
          {tab === "security" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Security Settings</h3>
              <div className="max-w-md space-y-4">
                <div className="rounded-2xl border border-[#E2E8F0] p-5">
                  <h4 className="font-semibold text-[#0F172A]">Two-Factor Authentication</h4>
                  <p className="mt-1 text-sm text-[#64748B]">Add an extra layer of security to your admin account.</p>
                  <button onClick={() => toast.success("2FA setup coming soon")} className="btn-secondary mt-3 !py-2 text-sm">Enable 2FA</button>
                </div>
                <div className="rounded-2xl border border-[#E2E8F0] p-5">
                  <h4 className="font-semibold text-[#0F172A]">Active Sessions</h4>
                  <p className="mt-1 text-sm text-[#64748B]">Manage devices where you're logged in.</p>
                  <div className="mt-3 rounded-xl bg-[#F8FAFC] p-3 text-sm text-[#64748B]">
                    <p className="font-medium text-[#0F172A]">Current Device</p>
                    <p>Browser · {new Date().toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#EF44441A] bg-[#FEF2F2] p-5">
                  <h4 className="font-semibold text-[#EF4444]">Danger Zone</h4>
                  <p className="mt-1 text-sm text-[#64748B]">Irreversible actions for your admin account.</p>
                  <button onClick={() => toast.error("Action restricted in demo mode")} className="mt-3 rounded-xl border border-[#EF4444] px-4 py-2 text-sm font-semibold text-[#EF4444] hover:bg-[#EF4444] hover:text-white">
                    Revoke All Sessions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
