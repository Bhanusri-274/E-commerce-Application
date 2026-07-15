import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { authService } from "../../services";

const ForgotPassword = () => {
  const { register, handleSubmit } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async ({ email }) => {
    try {
      setSubmitting(true);
      const res = await authService.forgotPassword(email);
      toast.success("Reset token generated");
      // In production the token is emailed; here we route directly for demo purposes.
      navigate(`/reset-password/${res.resetToken}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate reset token");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="card-surface w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Forgot Password</h1>
        <p className="mt-1 text-sm text-[#64748B]">Enter your email and we'll help you reset your password.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input {...register("email", { required: true })} type="email" placeholder="Email address" className="input-field pl-11" />
          </div>
          <button disabled={submitting} className="btn-primary w-full">{submitting ? "Please wait..." : "Send Reset Link"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Remembered your password? <Link to="/login" className="font-semibold text-[#2563EB]">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
