import React from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Login System</h2>
                
                <form className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Employee Email
                        </label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="name@company.com" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="relative">
                            <input 
                                id="password"
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200"
                    >
                        Login System
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-slate-600">
                    Belum punya akun? <button className="text-blue-600 hover:text-blue-700 font-medium">Hubungi IT Admin</button>
                </p>
            </div>
        </div>
    );
}