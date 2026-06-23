import { signup } from '@/app/auth/actions'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

export default async function SignupPage(props: {
  searchParams: Promise<{ message: string }>
}) {
  const searchParams = await props.searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950" />
      
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-tight mb-2">Join the movement.</h1>
          <p className="text-zinc-400">Play golf. Make an impact.</p>
        </div>

        <form action={signup} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400" htmlFor="full_name">
              Full Name
            </label>
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              name="full_name"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400" htmlFor="email">
              Email Address
            </label>
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400" htmlFor="country">
              Country
            </label>
            <div className="relative">
              <select
                name="country"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                required
                defaultValue="United States"
              >
                <option value="United States" className="bg-zinc-900">United States</option>
                <option value="India" className="bg-zinc-900">India</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                ▼
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400" htmlFor="password">
              Password
            </label>
            <PasswordInput name="password" placeholder="••••••••" />
          </div>

          <button className="group mt-4 bg-emerald-500 text-white hover:bg-emerald-400 font-medium rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            Create Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {searchParams?.message && (
            <p className="mt-4 p-4 bg-red-500/10 text-red-400 text-sm rounded-lg text-center border border-red-500/20">
              {searchParams.message}
            </p>
          )}

          <div className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
