import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import { authService } from "../../services";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async ({ password }) => {
    try {
      setSubmitting(true);
      await authService.resetPassword(token, password);
      toast.success("Password reset successfully. Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="card-surface w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Reset Password</h1>
        <p className="mt-1 text-sm text-[#64748B]">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input {...register("password", { required: true, minLength: 6 })} type="password" placeholder="New password" className="input-field pl-11" />
          </div>
          <button disabled={submitting} className="btn-primary w-full">{submitting ? "Updating..." : "Reset Password"}</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
