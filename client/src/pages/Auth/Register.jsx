import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  // Watch the password field so we can compare it in the confirm password validation
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      // Clean up the data object to exclude confirmPassword before sending to API
      const { confirmPassword, ...submitData } = data;
      await registerUser(submitData);
      toast.success("Account created successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="card-surface w-full max-w-md p-8">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-display text-xl font-bold text-white">S</span>
          <h1 className="mt-4 font-display text-2xl font-bold text-[#0F172A]">Create your account</h1>
          <p className="mt-1 text-sm text-[#64748B]">Join ShopEZ for a premium shopping experience</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          {/* Full Name */}
          <div>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input 
                {...register("name", { required: "Full name is required" })} 
                placeholder="Full name" 
                className="input-field pl-11" 
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-[#EF4444]">{errors.name.message}</p>}
          </div>

          {/* Email Address */}
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

          {/* Phone Number (Optional but validated if typed) */}
          <div>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input 
                {...register("phone", {
                  pattern: {
                    value: /^[0-9+() \s-]{7,15}$/,
                    message: "Please enter a valid phone number"
                  }
                })} 
                placeholder="Phone number (optional)" 
                className="input-field pl-11" 
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-[#EF4444]">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                {...register("password", { 
                  required: "Password is required", 
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 6 characters)"
                className="input-field pl-11 pr-11"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match"
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="input-field pl-11"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-[#EF4444]">{errors.confirmPassword.message}</p>}
          </div>

          <button disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Already have an account? <Link to="/login" className="font-semibold text-[#2563EB]">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;