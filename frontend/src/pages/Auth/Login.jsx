import { useState } from "react";
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/dessert-bg.png";
import { authService } from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Panggil API lewat authService
      const response = await authService.login(
        formData.email,
        formData.password,
      );

      if (response.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (response.user.role === "kasir") {
        navigate("/outlet/dashboard");
      } else if (response.user.role === "staff_produksi") {
        navigate("/produksi/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fa] font-sans antialiased selection:bg-pink-200 selection:text-pink-900">
      {/* Left side - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-pink-50 overflow-hidden">
        {/* Background Image */}
        <img
          src={bgImage}
          alt="Dessertation Background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍰</span>
            <span className="text-2xl font-bold tracking-wider">
              Dessertation
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              A Symphony of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                Sweet Flavors
              </span>
            </h1>
            <p className="text-lg text-gray-200 max-w-md">
              Manage your orders, discover new recipes, and elevate your pastry
              business to new heights.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative bg-white">
        {/* Decorative background blobs for right side (visible on mobile too) */}
        <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl opacity-60"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center lg:text-left mb-10">
            <div className="inline-flex lg:hidden items-center justify-center gap-2 mb-6 bg-pink-50 px-4 py-2 rounded-full">
              <span className="text-2xl">🍰</span>
              <span className="text-xl font-bold text-gray-800 tracking-wider">
                Dessertation
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700 block"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-200"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="text-sm font-medium text-gray-700 block"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-pink-600 hover:text-pink-500 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-200"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded cursor-pointer accent-pink-600"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-medium shadow-md transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800 shadow-gray-900/10 active:scale-[0.98]"
              }`}
            >
              <LogIn size={20} className={loading ? "animate-pulse" : ""} />
              <span>{loading ? "Signing in..." : "Sign in to account"}</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="#"
                className="font-semibold text-pink-600 hover:text-pink-500 hover:underline transition-all"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
