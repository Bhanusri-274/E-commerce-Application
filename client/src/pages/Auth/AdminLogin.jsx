import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const result = await login(data);
      if (result.role !== "admin") {
        toast.error("This account does not have admin access");
        return;
      }
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white">
            <ShieldCheck size={22} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-[#0F172A]">Admin Sign In</h1>
          <p className="mt-1 text-sm text-[#64748B]">ShopEZ Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input {...register("email", { required: true })} type="email" placeholder="Admin email" className="input-field pl-11" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input {...register("password", { required: true })} type="password" placeholder="Password" className="input-field pl-11" />
          </div>
          <button disabled={submitting} className="btn-primary w-full">{submitting ? "Signing in..." : "Sign In"}</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
