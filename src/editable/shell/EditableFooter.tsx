'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const wrapper = 'mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8'

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'image' && task.key !== 'profile')
  const { session, logout } = useEditableLocalAuthSession()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[rgba(75,86,210,0.18)] bg-white text-[#472183]">
      <div className="border-b border-[rgba(75,86,210,0.18)] bg-[#F1F6F5]">
        <div className={`${wrapper} py-8`}>
          <div className="grid gap-5 rounded-[28px] border border-[rgba(75,86,210,0.18)] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.08)] sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">Browse smarter</p>
              <h2 className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-[#472183]">Quick access before you leave</h2>
            </div>
            <div className="rounded-[22px] bg-[rgba(130,195,236,0.14)] px-5 py-4">
              <p className="text-sm font-semibold text-[#472183]">Popular paths</p>
              <p className="mt-2 text-sm leading-7 text-[rgba(71,33,131,0.72)]">Open listings, articles, and resource pages without going back to the top.</p>
            </div>
            <div className="rounded-[22px] bg-[rgba(130,195,236,0.14)] px-5 py-4">
              <p className="text-sm font-semibold text-[#472183]">Need something specific?</p>
              <p className="mt-2 text-sm leading-7 text-[rgba(71,33,131,0.72)]">Use search, jump into categories, or contact the site for support.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${wrapper} py-10`}>
        <div className="flex flex-col gap-8 border-b border-[rgba(75,86,210,0.18)] pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(75,86,210,0.18)] bg-[#F1F6F5] shadow-[0_8px_18px_rgba(71,33,131,0.08)]">
              <img src="/favicon.png?v=20260413" alt="" className="h-9 w-9 object-contain" />
            </span>
            <span className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#472183]">
              Lorena<span className="text-[#4B56D2]">sLinks</span>
            </span>
            <p className="max-w-2xl text-sm leading-7 text-[rgba(71,33,131,0.72)]">
              {globalContent.footer.description}
            </p>
          </div>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[1.05fr_2fr]">
          <div>
            <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[#472183]">
              One place for local discovery and useful public pages.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-8 text-[rgba(71,33,131,0.72)]">
              Browse the site like a modern directory: fast search, strong visuals, practical category paths, and pages that stay easy to scan on every screen size.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <h3 className="text-xl font-extrabold tracking-[-0.02em] text-[#472183]">Quick Links</h3>
              <div className="mt-5 grid gap-3 text-sm text-[rgba(71,33,131,0.72)]">
                <Link href="/about" className="hover:text-[#4b56d2]">About us</Link>
                <Link href="/contact" className="hover:text-[#4b56d2]">Advertise</Link>
                <Link href="/create" className="hover:text-[#4b56d2]">Free Listing</Link>
                <Link href="/search" className="hover:text-[#4b56d2]">Search</Link>
                {session ? (
                  <button type="button" onClick={logout} className="text-left hover:text-[#4b56d2]">
                    Logout
                  </button>
                ) : (
                  <>
                    <Link href="/login" className="hover:text-[#4b56d2]">Login</Link>
                    <Link href="/signup" className="hover:text-[#4b56d2]">Sign up</Link>
                  </>
                )}
              </div>
            </div>

            <div className="sm:col-span-1 xl:col-span-3">
              <h3 className="text-xl font-extrabold tracking-[-0.02em] text-[#472183]">Browse Categories</h3>
              <div className="mt-5 grid gap-x-6 gap-y-3 text-sm text-[rgba(71,33,131,0.72)] sm:grid-cols-2 lg:grid-cols-3">
                {taskLinks.map((task) => (
                  <Link key={task.key} href={task.route} className="hover:text-[#4b56d2]">
                    {task.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(75,86,210,0.18)] bg-[#F1F6F5]">
        <div className={`flex flex-col gap-2 py-5 text-sm text-[rgba(71,33,131,0.72)] sm:flex-row sm:items-center sm:justify-between ${wrapper}`}>
          <p>Copyright {year}. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="hover:text-[#4b56d2]">Privacy</Link>
            <Link href="/contact" className="hover:text-[#4b56d2]">Terms</Link>
            <Link href="/contact" className="hover:text-[#4b56d2]">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
