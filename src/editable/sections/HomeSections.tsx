import Link from 'next/link'
import { ArrowRight, BellRing, Bookmark, Building2, ChevronRight, FileText, Globe2, MapPin, Megaphone, Search, Sparkles, Star } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: FileText,
  sbm: Bookmark,
  pdf: FileText,
  profile: FileText,
}

const container = 'mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8'
const cardClass = 'rounded-[24px] border border-[#d7def2] bg-white shadow-[0_10px_28px_rgba(71,33,131,0.08)]'
const placeholder = '/placeholder.svg?height=900&width=1200'

function cleanText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function excerpt(post?: SitePost | null, limit = 120) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const text = cleanText(raw)
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text
}

function categoryOf(post?: SitePost | null, fallback = 'Featured') {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category.trim()) || post?.tags?.[0] || fallback
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((4 + (hashStr(post.slug || post.id || post.title || 'x') % 8) / 10) * 10) / 10
}

function reviewsOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.reviewCount ?? content.reviews)
  if (real > 0) return Math.floor(real)
  return 18 + (hashStr((post.slug || post.title || 'x') + 'reviews') % 480)
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  return posts.filter((post) => {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function sectionPosts(posts: SitePost[], timeSections: HomeTimeSection[]) {
  return dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
}

function taskLabel(task: TaskKey) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.label || task
}

function Stars({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="inline-flex items-center gap-[2px]">
        {[0, 1, 2, 3, 4].map((idx) => (
          <Star key={idx} className={`h-4 w-4 ${idx < filled ? 'fill-[#4B56D2] text-[#4B56D2]' : 'fill-[rgba(75,86,210,0.16)] text-[rgba(75,86,210,0.16)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[#472183]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[rgba(71,33,131,0.72)]">({reviewsOf(post)})</span>
    </div>
  )
}

function routeForTask(task?: (typeof SITE_CONFIG.tasks)[number]) {
  return task?.route || '/'
}

function searchTasks() {
  return SITE_CONFIG.tasks.filter((task) => task.enabled)
}

function visibleTasks() {
  return searchTasks().filter((task) => task.key !== 'image' && task.key !== 'profile')
}

function pickImage(post?: SitePost | null) {
  return getEditablePostImage(post) || placeholder
}

function FeaturedPosterCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#472183_0%,#4B56D2_52%,#82C3EC_100%)] text-[#F1F6F5] shadow-[0_22px_60px_rgba(47,15,131,0.28)]">
      <div className="grid min-h-[238px] gap-5 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/88">
              {categoryOf(post, 'Spotlight')}
            </span>
            <h2 className="mt-4 max-w-[18ch] text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] md:text-[3.15rem]">
              {post.title}
            </h2>
            <p className="mt-4 max-w-[42ch] text-sm leading-7 text-white/82 md:text-base">{excerpt(post, 150) || 'Explore a fresh local highlight, useful page, or directory feature picked for the front page.'}</p>
          </div>
          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-2xl bg-[#F1F6F5] px-5 py-3 text-sm font-bold text-[#472183] transition group-hover:translate-x-1">
            Explore now <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <div className="relative min-h-[180px] overflow-hidden rounded-[24px] border border-white/12 bg-white/10">
          <img src={pickImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.05]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,18,44,0.02),rgba(15,18,44,0.56))]" />
        </div>
      </div>
    </Link>
  )
}

function VerticalPromoCard({ title, subtitle, href, image, tone }: { title: string; subtitle: string; href: string; image: string; tone: string }) {
  return (
    <Link href={href} className={`group relative min-h-[238px] overflow-hidden rounded-[24px] ${tone} p-5 text-white shadow-[0_18px_40px_rgba(71,33,131,0.16)]`}>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <h3 className="max-w-[10ch] text-[1.65rem] font-extrabold leading-[1.05] tracking-[-0.03em]">{title}</h3>
          <p className="mt-3 max-w-[14ch] text-sm leading-6 text-white/88">{subtitle}</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 transition group-hover:translate-x-1">
          <ChevronRight className="h-5 w-5" />
        </span>
      </div>
      <img src={image} alt="" className="pointer-events-none absolute bottom-0 right-0 h-[82%] w-[68%] object-cover object-center transition duration-500 group-hover:scale-[1.04]" />
    </Link>
  )
}

function CategoryTile({ label, href, Icon }: { label: string; href: string; Icon: typeof FileText }) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-3 text-center">
      <span className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-[#d8dff1] bg-white shadow-[0_8px_18px_rgba(71,33,131,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[#4b56d2]">
        <Icon className="h-8 w-8 text-[#4b56d2]" />
      </span>
      <span className="max-w-[92px] text-sm font-medium leading-5 text-[#472183]">{label}</span>
    </Link>
  )
}

function TopicPanel({ title, posts, task, route }: { title: string; posts: SitePost[]; task: TaskKey; route: string }) {
  const visible = posts.slice(0, 3)
  if (!visible.length) return null
  return (
    <section className={`${cardClass} p-6`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[1.85rem] font-extrabold tracking-[-0.03em] text-[#472183]">{title}</h2>
        <Link href={route} className="text-sm font-semibold text-[#4b56d2] hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {visible.map((post) => (
          <Link key={post.id || post.slug} href={postHref(task, post, route)} className="group block">
            <div className="overflow-hidden rounded-[18px] bg-[#dfe7fb]">
              <img src={pickImage(post)} alt={post.title} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
            </div>
            <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-7 text-[#472183] group-hover:text-[#4b56d2]">{post.title}</h3>
            <p className="mt-1 text-sm text-[rgba(71,33,131,0.72)]">{categoryOf(post, title)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function TrendingCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group grid min-w-0 overflow-hidden rounded-[20px] border border-[#d8dff1] bg-white transition hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(71,33,131,0.12)] sm:grid-cols-[108px_minmax(0,1fr)]">
      <div className="overflow-hidden bg-[#eef2fc]">
        <img src={pickImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-[1.35rem] font-extrabold leading-8 tracking-[-0.03em] text-[#472183]">{post.title}</h3>
        <p className="mt-2 inline-flex items-center gap-1 text-base font-medium text-[#4B56D2]">
          Explore <ChevronRight className="h-4 w-4" />
        </p>
      </div>
    </Link>
  )
}

function PosterReviewCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block">
      <div className="overflow-hidden rounded-[18px] bg-[#e7ebfa] shadow-[0_10px_20px_rgba(71,33,131,0.06)]">
        <img src={pickImage(post)} alt={post.title} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <h3 className="mt-4 line-clamp-2 text-[1.05rem] font-extrabold leading-8 tracking-[-0.02em] text-[#472183]">{post.title}</h3>
      <p className="mt-1 text-sm text-[rgba(71,33,131,0.72)]">{categoryOf(post, 'Profile')} · Directory pick</p>
      <Stars post={post} />
    </Link>
  )
}

function CompactEditorialCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group flex gap-4 rounded-[22px] border border-[#d8dff1] bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_14px_24px_rgba(71,33,131,0.1)]">
      <div className="h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[16px] bg-[#e7ebfa]">
        <img src={pickImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4b56d2]">{categoryOf(post, 'Update')}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-7 tracking-[-0.02em] text-[#472183]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[rgba(71,33,131,0.72)]">{excerpt(post, 92) || 'A quick look at what visitors are opening right now.'}</p>
      </div>
    </Link>
  )
}

function UtilityTile({ label, Icon }: { label: string; Icon: typeof BellRing }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="flex h-[96px] w-[96px] items-center justify-center rounded-[24px] border border-[#d8dff1] bg-white shadow-[0_8px_18px_rgba(71,33,131,0.06)]">
        <Icon className="h-8 w-8 text-[#4b56d2]" />
      </span>
      <span className="text-base font-medium text-[#472183]">{label}</span>
    </div>
  )
}

function FooterIntroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#d8dff1] bg-white px-4 py-3 text-center shadow-[0_8px_18px_rgba(71,33,131,0.06)]">
      <p className="text-xl font-extrabold text-[#472183]">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[rgba(71,33,131,0.72)]">{label}</p>
    </div>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const allPosts = sectionPosts(posts, timeSections)
  const featured = allPosts[0]
  const heroCategories = (() => {
    const tasks = visibleTasks()
    return tasks.slice(0, 10)
  })()
  const promoTasks = visibleTasks()
  const promos = promoTasks.slice(0, 3).map((task, index) => ({
    title: task.label,
    subtitle:
      index === 0
        ? 'Browse highlighted pages and featured discoveries'
        : index === 1
          ? 'Find recent updates, covers, and useful reads'
          : 'Scan practical local pages and curated directories',
    href: routeForTask(task),
    image: pickImage(allPosts[index + 1] || featured),
    tone:
      index === 0
        ? 'bg-[linear-gradient(180deg,#82C3EC_0%,#4B56D2_100%)]'
        : index === 1
          ? 'bg-[linear-gradient(180deg,#4B56D2_0%,#472183_100%)]'
          : 'bg-[linear-gradient(180deg,#82C3EC_0%,#472183_100%)]',
  }))

  return (
    <section className="border-b border-[#dce3f5] bg-white">
      <div className={`${container} py-8 sm:py-10`}>
        <div className="flex flex-col gap-8">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.4fr))]">
            {featured ? <FeaturedPosterCard post={featured} href={postHref(primaryTask, featured, primaryRoute)} /> : null}
            {promos.map((promo) => (
              <VerticalPromoCard key={promo.title} {...promo} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10">
            {heroCategories.map((task) => {
              const Icon = taskIcon[task.key] || FileText
              return <CategoryTile key={task.key} label={task.label} href={task.route} Icon={Icon} />
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const allPosts = sectionPosts(posts, timeSections).slice(0, 4)
  if (!allPosts.length) return null
  return (
    <section className="bg-[#f5f8ff]">
      <div className={`${container} py-10 sm:py-12`}>
        <div className={`${cardClass} p-6 sm:p-8`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(130,195,236,0.24)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#472183]">
                <Sparkles className="h-3.5 w-3.5" /> Trending searches
              </span>
              <h2 className="mt-4 text-[2rem] font-extrabold tracking-[-0.03em] text-[#472183] sm:text-[2.2rem]">Popular right now</h2>
              <p className="mt-2 text-base text-[rgba(71,33,131,0.72)]">Quick picks from the latest local and directory activity.</p>
            </div>
            <Link href={primaryRoute} className="text-sm font-semibold text-[#4b56d2] hover:underline">
              Browse {taskLabel(primaryTask).toLowerCase()}
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {allPosts.map((post) => (
              <TrendingCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const allPosts = sectionPosts(posts, timeSections)
  const topicSets = [
    { title: 'Featured pages', items: allPosts.slice(0, 3) },
    { title: 'Visual highlights', items: allPosts.slice(3, 6) },
    { title: 'Fresh discoveries', items: allPosts.slice(6, 9) },
    { title: 'Community picks', items: allPosts.slice(9, 12) },
  ].filter((section) => section.items.length)

  if (!topicSets.length) return null

  return (
    <section className="bg-white">
      <div className={`${container} grid gap-8 py-10 sm:py-12 lg:grid-cols-2`}>
        {topicSets.map((section) => (
          <TopicPanel key={section.title} title={section.title} posts={section.items} task={primaryTask} route={primaryRoute} />
        ))}
      </div>
    </section>
  )
}

const sectionCopy: Record<string, { title: string; subtitle: string }> = {
  spotlight: { title: 'What people are opening now', subtitle: 'Fast-moving highlights from the newest pages.' },
  browse: { title: 'Latest reviews and highlights', subtitle: 'A scrolling mix of editorial picks and visual-first cards.' },
  index: { title: 'From the broader archive', subtitle: 'Evergreen pages that still earn repeat visits.' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const fallback = [
    { key: 'spotlight', posts: posts.slice(0, 5), href: primaryRoute },
    { key: 'browse', posts: posts.slice(5, 10), href: primaryRoute },
    { key: 'index', posts: posts.slice(10, 15), href: primaryRoute },
  ]
  const visible = (timeSections.length ? timeSections : fallback).filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { title: 'More to discover', subtitle: 'Fresh pages from across the site.' }
        const cards = section.posts.slice(0, 5)
        return (
          <section key={section.key} className={index % 2 === 0 ? 'bg-[#f5f8ff]' : 'bg-white'}>
            <div className={`${container} py-10 sm:py-12`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[#472183]">{copy.title}</h2>
                  <p className="mt-2 text-base text-[rgba(71,33,131,0.72)]">{copy.subtitle}</p>
                </div>
                <Link href={section.href || primaryRoute} className="text-sm font-semibold text-[#4b56d2] hover:underline">
                  See all <ArrowRight className="ml-1 inline h-4 w-4" />
                </Link>
              </div>

              {cards[0] ? (
                <div className="mt-7 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className={`${cardClass} p-5 sm:p-6`}>
                    <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                      <Link href={postHref(primaryTask, cards[0], primaryRoute)} className="group block overflow-hidden rounded-[22px] bg-[#e9eefc]">
                        <img src={pickImage(cards[0])} alt={cards[0].title} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                      </Link>
                      <div className="flex flex-col justify-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4b56d2]">{categoryOf(cards[0], 'Featured')}</p>
                        <Link href={postHref(primaryTask, cards[0], primaryRoute)} className="mt-3 text-[2rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#472183] hover:text-[#4b56d2]">
                          {cards[0].title}
                        </Link>
                        <Stars post={cards[0]} />
                        <p className="mt-3 text-sm leading-7 text-[rgba(71,33,131,0.72)]">{excerpt(cards[0], 180) || 'A featured story with room for a fuller summary, stronger hierarchy, and a more editorial feel.'}</p>
                        <Link href={postHref(primaryTask, cards[0], primaryRoute)} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#4B56D2]">
                          Read full page <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {cards.slice(1, 4).map((post) => (
                      <CompactEditorialCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                    ))}
                  </div>
                </div>
              ) : null}

              {cards.length > 1 ? (
                <div className="mt-8">
                  <h3 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[#472183]">Latest posters and covers</h3>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {cards.map((post) => (
                      <PosterReviewCard key={`poster-${post.id || post.slug}`} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  const utilityItems = [
    { label: 'Saved pages', Icon: Bookmark },
    { label: 'Collections', Icon: Globe2 },
    { label: 'Local guides', Icon: Globe2 },
    { label: 'Alerts', Icon: BellRing },
  ]
  return (
    <>
      <section className="bg-white">
        <div className={`${container} py-10 sm:py-12`}>
          <div className={`${cardClass} grid gap-8 border-[#d6ddf1] px-6 py-8 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]`}>
            <div>
              <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[#472183]">{pagesContent.home.cta.title}</h2>
              <p className="mt-4 max-w-md text-base leading-8 text-[rgba(71,33,131,0.72)]">{pagesContent.home.cta.description}</p>
              <Link href="/create" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#4B56D2]">
                Explore more <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {utilityItems.map((item) => (
                <UtilityTile key={item.label} label={item.label} Icon={item.Icon as typeof BellRing} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#dde3f5] bg-[#fbfcff]">
        <div className={`${container} py-10 sm:py-14`}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[#472183]">A playful directory with room to browse</h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-[rgba(71,33,131,0.72)]">
                {SITE_CONFIG.name} brings together useful posts, practical discovery, and directory-style browsing in one clean place. Scan quickly and open the pages that matter without losing your place.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:min-w-[330px]">
              <FooterIntroStat label="Sections" value={String(visibleTasks().length)} />
              <FooterIntroStat label="Style" value="Fresh" />
              <FooterIntroStat label="Focus" value="Local" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
