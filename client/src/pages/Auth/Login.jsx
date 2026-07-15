import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await login(data);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="card-surface w-full max-w-md p-8">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-display text-xl font-bold text-white">S</span>
          <h1 className="mt-4 font-display text-2xl font-bold text-[#0F172A]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#64748B]">Sign in to continue to ShopEZ</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          {/* Email Field */}
          <div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input 
                {...register("email", { 
                  required: "Email address is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Please enter a valid email address"
                  }
                })} 
                type="email" 
                placeholder="Email address" 
                className="input-field pl-11" 
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input 
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long"
                  }
                })} 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="input-field pl-11 pr-11" 
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>}
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-[#2563EB]">Forgot password?</Link>
          </div>

          <button disabled={submitting} className="btn-primary w-full">{submitting ? "Signing in..." : "Sign In"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Don't have an account? <Link to="/register" className="font-semibold text-[#2563EB]">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;