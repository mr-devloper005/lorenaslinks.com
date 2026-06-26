'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, BriefcaseBusiness, ChevronDown, LogIn, Menu, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const wrapper = 'mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const navItems = useMemo(
    () =>
      SITE_CONFIG.tasks
        .filter((task) => task.enabled && task.key !== 'image' && task.key !== 'profile')
        .map((task) => ({ label: task.label, href: task.route })),
    []
  )

  const topLinks = [
    { label: 'Discover', href: '/' },
    ...navItems.slice(0, 4),
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(75,86,210,0.18)] bg-[rgba(241,246,245,0.95)] text-[#472183] backdrop-blur-md">
      <div className={`hidden items-center justify-between py-3 text-sm text-[rgba(71,33,131,0.74)] lg:flex ${wrapper}`}>
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4 text-[#4b56d2]" />
          <span>EN</span>
        </div>
        <div className="flex items-center gap-7">
          <Link href="/" className="hover:text-[#4b56d2]">We are Hiring</Link>
          <Link href="/about" className="hover:text-[#4b56d2]">Investor Relations</Link>
          <Link href="/create" className="inline-flex items-center gap-2 rounded-xl border border-[rgba(71,33,131,0.26)] px-3 py-1.5 font-semibold text-[#472183] hover:border-[#4b56d2] hover:text-[#4b56d2]">
            <BriefcaseBusiness className="h-4 w-4" /> Leads
          </Link>
          <Link href="/contact" className="hover:text-[#4b56d2]">Advertise</Link>
          <Link href="/create" className="relative hover:text-[#4b56d2]">
            <span className="absolute -top-3 left-5 rounded bg-[#82C3EC] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#472183]">Business</span>
            Free Listing
          </Link>
          <Bell className="h-4 w-4" />
          {session ? (
            <button onClick={logout} type="button" className="rounded-xl bg-[#4B56D2] px-4 py-2 font-semibold text-[#F1F6F5] hover:bg-[#472183]">
              Logout
            </button>
          ) : (
            <Link href="/login" className="rounded-xl bg-[#4B56D2] px-4 py-2 font-semibold text-[#F1F6F5] hover:bg-[#472183]">
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-4 py-4 ${wrapper}`}>
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(75,86,210,0.18)] bg-[#F1F6F5] shadow-[0_8px_18px_rgba(71,33,131,0.08)]">
            <img src="/favicon.png?v=20260413" alt="" className="h-9 w-9 object-contain" />
          </span>
          <span className="editable-display text-[2.2rem] font-extrabold tracking-[-0.06em] text-[#472183]">
            Lorena<span className="text-[#4B56D2]">sLinks</span>
          </span>
          <span className="sr-only">{SITE_CONFIG.name}</span>
        </Link>

        <form action="/search" className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          <label className="flex h-[54px] flex-1 items-center gap-3 rounded-xl border border-[rgba(75,86,210,0.18)] bg-white px-4 shadow-[0_4px_12px_rgba(71,33,131,0.06)]">
            <Search className="h-5 w-5 text-[#4B56D2]" />
            <input
              name="q"
              defaultValue=""
              placeholder={globalContent.nav.searchPlaceholder}
              className="w-full bg-transparent text-base font-medium outline-none placeholder:text-[#7a83a7]"
            />
            <button className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4B56D2] text-[#F1F6F5] hover:bg-[#472183]">
              <Search className="h-4 w-4" />
            </button>
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          {session ? (
            <button onClick={logout} type="button" className="hidden rounded-lg bg-[#4B56D2] px-3 py-2 text-sm font-semibold text-[#F1F6F5] sm:inline-flex">
              Logout
            </button>
          ) : (
            <Link href="/login" className="hidden rounded-lg bg-[#4B56D2] px-3 py-2 text-sm font-semibold text-[#F1F6F5] sm:inline-flex">
              Login
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(75,86,210,0.18)] bg-white"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="hidden border-t border-[rgba(75,86,210,0.18)] lg:block">
        <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 py-3 text-sm text-[rgba(71,33,131,0.74)] ${wrapper}`}>
          {topLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href} className={active ? 'font-semibold text-[#1f2340]' : 'hover:text-[#4b56d2]'}>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {open ? (
        <div className="border-t border-[rgba(75,86,210,0.18)] bg-[#F1F6F5] lg:hidden">
          <div className={`${wrapper} py-4`}>
            <form action="/search" className="grid gap-3">
              <label className="flex h-12 items-center gap-3 rounded-xl border border-[#ced7ea] bg-white px-4">
                <Search className="h-4 w-4 text-[#7a83a7]" />
                <input name="q" placeholder={globalContent.nav.searchPlaceholder} className="w-full bg-transparent text-sm font-medium outline-none" />
              </label>
            </form>

            <div className="mt-4 grid gap-2">
              {topLinks.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#232744] shadow-[0_6px_16px_rgba(71,33,131,0.05)]">
                  {item.label}
                </Link>
              ))}
              {session ? (
                <Link href="/create" onClick={() => setOpen(false)} className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#232744] shadow-[0_6px_16px_rgba(71,33,131,0.05)]">
                  Create
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#232744] shadow-[0_6px_16px_rgba(71,33,131,0.05)]">
                    <LogIn className="h-4 w-4" /> Login
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#232744] shadow-[0_6px_16px_rgba(71,33,131,0.05)]">
                    <UserPlus className="h-4 w-4" /> Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
