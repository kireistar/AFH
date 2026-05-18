import React from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tight uppercase mb-2">
                        <span className="text-[#B91C1C]">AFH</span>
                        <span className="text-[#1E3A8A]"> System</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-400">Silakan login ke akun Anda</p>
                </div>
                
                <form className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 tracking-tight">
                            Employee Email
                        </label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="name@company.com" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" 
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-bold text-slate-700 tracking-tight">
                            Password
                        </label>
                        <div className="relative">
                            <input 
                                id="password"
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" 
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A8A] text-xs font-bold uppercase tracking-wider"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-xl font-bold uppercase tracking-wider hover:bg-blue-900 active:scale-95 transition-all duration-200 shadow-sm mt-4"
                    >
                        Login System
                    </button>
                </form>

                <p className="mt-6 text-center text-sm font-medium text-slate-500">
                    Belum punya akun? <button className="text-[#1E3A8A] hover:underline font-bold">Hubungi IT Admin</button>
                </p>
            </div>
        </div>
    );
}