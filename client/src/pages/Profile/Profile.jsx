import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { User, MapPin, Lock, Bell, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { userService, authService } from "../../services";
import EmptyState from "../../components/common/EmptyState";

const TABS = [
  { id: "info",       label: "Profile Info",    icon: User    },
  { id: "addresses",  label: "Addresses",       icon: MapPin  },
  { id: "password",   label: "Change Password", icon: Lock    },
  { id: "notifications", label: "Notifications", icon: Bell   },
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("info");

  const infoForm     = useForm({ defaultValues: { name: user?.name, phone: user?.phone || "" } });
  const addressForm  = useForm({
    defaultValues: { label:"Home", fullName:"", phone:"", line1:"", line2:"", city:"", state:"", postalCode:"", country:"India", isDefault:false },
  });
  const passwordForm = useForm();

  const onSaveInfo = async (data) => {
    const res = await userService.updateProfile(data);
    const updated = { ...user, ...res.data };
    setUser(updated);
    localStorage.setItem("shopez_user", JSON.stringify(updated));
    toast.success("Profile updated ✓");
  };

  const onAddAddress = async (data) => {
    const res = await userService.addAddress(data);
    const updated = { ...user, addresses: res.data };
    setUser(updated);
    localStorage.setItem("shopez_user", JSON.stringify(updated));
    toast.success("Address added ✓");
    addressForm.reset();
  };

  const onDeleteAddress = async (id) => {
    const res = await userService.deleteAddress(id);
    const updated = { ...user, addresses: res.data };
    setUser(updated);
    localStorage.setItem("shopez_user", JSON.stringify(updated));
    toast.success("Address removed");
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match"); return;
    }
    try {
      await authService.changePassword(data);
      toast.success("Password updated ✓");
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update password");
    }
  };

  return (
    <div className="section-container py-8">
      <h1 className="font-display text-2xl font-bold text-[#0F172A]">My Profile</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar tabs */}
        <div className="flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-[#2563EB] text-white shadow-[0_4px_16px_-4px_rgba(37,99,235,0.4)]"
                  : "bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}>
              <t.icon size={15}/> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card-surface p-6">

          {/* Profile Info */}
          {tab === "info" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Profile Information</h3>
              {/* Avatar */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-display text-2xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-semibold text-[#0F172A]">{user?.name}</p>
                  <p className="text-sm text-[#64748B]">{user?.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-[#2563EB1A] px-2 py-0.5 text-xs font-semibold text-[#2563EB]">
                    {user?.role === "admin" ? "Administrator" : "Customer"}
                  </span>
                </div>
              </div>

              <form onSubmit={infoForm.handleSubmit(onSaveInfo)} className="max-w-md space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Full Name</label>
                  <input {...infoForm.register("name", { required: true })} className="input-field"/>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Phone Number</label>
                  <input {...infoForm.register("phone")} placeholder="+91 98765 43210" className="input-field"/>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Email Address</label>
                  <input value={user?.email} disabled className="input-field cursor-not-allowed bg-[#F8FAFC] text-[#94A3B8]"/>
                  <p className="mt-1 text-xs text-[#94A3B8]">Email cannot be changed</p>
                </div>
                <button className="btn-primary">Save Changes</button>
              </form>
            </div>
          )}

          {/* Addresses */}
          {tab === "addresses" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Saved Addresses</h3>

              {(user?.addresses || []).length === 0 ? (
                <div className="mb-6">
                  <EmptyState icon={MapPin} title="No addresses saved" description="Add a delivery address to speed up checkout."/>
                </div>
              ) : (
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(user?.addresses || []).map((a) => (
                    <div key={a._id} className={`relative rounded-2xl border-2 p-4 ${a.isDefault ? "border-[#2563EB]" : "border-[#E2E8F0]"}`}>
                      {a.isDefault && (
                        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">
                          <CheckCircle2 size={10}/> Default
                        </span>
                      )}
                      <p className="font-semibold text-[#0F172A]">{a.label}</p>
                      <p className="mt-1 text-sm text-[#64748B]">{a.fullName}</p>
                      <p className="text-sm text-[#64748B]">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                      <p className="text-sm text-[#64748B]">{a.city}, {a.state} {a.postalCode}</p>
                      <p className="text-sm text-[#64748B]">{a.phone}</p>
                      <button onClick={() => onDeleteAddress(a._id)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#EF4444] hover:underline">
                        <Trash2 size={12}/> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-[#E2E8F0] pt-5">
                <h4 className="mb-4 flex items-center gap-2 font-display font-semibold text-[#0F172A]">
                  <Plus size={16} className="text-[#2563EB]"/> Add New Address
                </h4>
                <form onSubmit={addressForm.handleSubmit(onAddAddress)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input {...addressForm.register("label")} placeholder="Label (Home / Work / Other)" className="input-field sm:col-span-2"/>
                  <input {...addressForm.register("fullName", { required: true })} placeholder="Full name *" className="input-field"/>
                  <input {...addressForm.register("phone", { required: true })} placeholder="Phone number *" className="input-field"/>
                  <input {...addressForm.register("line1", { required: true })} placeholder="Address line 1 *" className="input-field sm:col-span-2"/>
                  <input {...addressForm.register("line2")} placeholder="Address line 2 (optional)" className="input-field sm:col-span-2"/>
                  <input {...addressForm.register("city", { required: true })} placeholder="City *" className="input-field"/>
                  <input {...addressForm.register("state", { required: true })} placeholder="State *" className="input-field"/>
                  <input {...addressForm.register("postalCode", { required: true })} placeholder="Postal code *" className="input-field"/>
                  <input {...addressForm.register("country")} placeholder="Country" className="input-field"/>
                  <label className="flex items-center gap-2 text-sm text-[#64748B] sm:col-span-2">
                    <input type="checkbox" {...addressForm.register("isDefault")} className="accent-[#2563EB]"/>
                    Set as default address
                  </label>
                  <button className="btn-primary sm:col-span-2">Add Address</button>
                </form>
              </div>
            </div>
          )}

          {/* Change Password */}
          {tab === "password" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Change Password</h3>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="max-w-md space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Current Password</label>
                  <input type="password" {...passwordForm.register("currentPassword", { required: true })} className="input-field"/>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">New Password</label>
                  <input type="password" {...passwordForm.register("newPassword", { required: true, minLength: 6 })} className="input-field"/>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Confirm New Password</label>
                  <input type="password" {...passwordForm.register("confirmPassword", { required: true })} className="input-field"/>
                </div>
                <button className="btn-primary">Update Password</button>
              </form>
            </div>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div>
              <h3 className="mb-5 font-display text-lg font-semibold text-[#0F172A]">Notification Preferences</h3>
              <div className="max-w-md space-y-4">
                {[
                  { label: "Order updates",       desc: "Shipping, delivery and status updates" },
                  { label: "Promotions & offers",  desc: "Exclusive deals and coupon codes" },
                  { label: "New arrivals",         desc: "Be the first to know about new products" },
                  { label: "Review reminders",     desc: "Reminders to review purchased products" },
                ].map((n) => (
                  <div key={n.label} className="flex items-start justify-between gap-4 rounded-xl border border-[#E2E8F0] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{n.label}</p>
                      <p className="text-xs text-[#64748B]">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only"/>
                      <div className="peer h-6 w-11 rounded-full bg-[#E2E8F0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-[#2563EB] peer-checked:after:translate-x-full"/>
                    </label>
                  </div>
                ))}
                <button onClick={() => toast.success("Preferences saved")} className="btn-primary">Save Preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
