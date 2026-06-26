import Link from 'next/link'
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  Globe,
  MapPin,
  Phone,
  Search,
  Star,
  UserRound,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const placeholder = '/placeholder.svg?height=900&width=1200'

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo) || asText(content.avatar)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((4 + (hashStr(post.slug || post.id || post.title || 'x') % 8) / 10) * 10) / 10
}

const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 18 + (hashStr((post.slug || post.title || 'x') + 'reviews') % 480)
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

function RatingRow({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="inline-flex items-center gap-[2px]">
        {[0, 1, 2, 3, 4].map((idx) => (
          <Star key={idx} className={`h-4 w-4 ${idx < filled ? 'fill-[#ff7a00] text-[#ff7a00]' : 'fill-[#dee5f6] text-[#dee5f6]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[#202542]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[#6a7398]">({reviewsOf(post)})</span>
    </div>
  )
}

function SearchBar({ basePath }: { basePath: string }) {
  return (
    <form action="/search" className="grid gap-3 rounded-[24px] border border-[#d8dff1] bg-white p-4 shadow-[0_10px_24px_rgba(71,33,131,0.06)] sm:grid-cols-[220px_minmax(0,1fr)]">
      <label className="flex h-12 items-center gap-3 rounded-xl border border-[#d2daf0] bg-white px-4">
        <MapPin className="h-4 w-4 text-[#7a83a8]" />
        <input name="location" defaultValue="Mumbai" className="w-full bg-transparent text-sm font-medium outline-none" />
      </label>
      <label className="flex h-12 items-center gap-3 rounded-xl border border-[#d2daf0] bg-white px-4">
        <Search className="h-4 w-4 text-[#7a83a8]" />
        <input name="q" placeholder={`Search ${basePath.replace('/', '') || 'pages'}`} className="w-full bg-transparent text-sm font-medium outline-none" />
      </label>
    </form>
  )
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const featured = posts[0]
  const miniCards = posts.slice(1, 4)
  const gridPosts = posts.slice(4)

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[#f5f8ff] text-[#202542]">
        <section className="border-b border-[#dde3f5] bg-white">
          <div className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_380px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4b56d2]">{theme.kicker}</p>
                <h1 className="mt-4 max-w-3xl text-balance text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#161a34] sm:text-[3.25rem]">
                  {voice?.headline || `Browse ${label}`}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#667094]">{voice?.description || theme.note}</p>
                {voice?.chips?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {voice.chips.map((chip) => (
                      <span key={chip} className="rounded-full border border-[#d9e0f1] bg-[#f6f8ff] px-3.5 py-1.5 text-xs font-semibold text-[#5e688f]">
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(135deg,#472183_0%,#4b56d2_55%,#7fbfe8_100%)] p-6 text-white shadow-[0_22px_50px_rgba(71,33,131,0.22)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/78">Browse snapshot</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SnapshotTile label="Visible posts" value={String(posts.length)} />
                  <SnapshotTile label="Current filter" value={categoryLabel} />
                  <SnapshotTile label="Page" value={`${page}/${pagination.totalPages || 1}`} />
                  <SnapshotTile label="Section" value={label} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <SearchBar basePath={basePath} />
              <form action={basePath} className="flex items-center gap-2 rounded-[24px] border border-[#d8dff1] bg-white p-4 shadow-[0_10px_24px_rgba(71,33,131,0.06)]">
                <div className="relative min-w-0 flex-1">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 w-full appearance-none rounded-xl border border-[#d2daf0] bg-white pl-4 pr-10 text-sm font-medium text-[#202542] outline-none"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#70789b]" />
                </div>
                <button className="inline-flex h-12 items-center rounded-xl bg-[#ff5a1f] px-5 text-sm font-bold text-white hover:bg-[#ef4d12]">
                  Apply
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {posts.length ? (
            <>
              {featured ? (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.4fr))]">
                  <ArchiveFeaturedCard post={featured} href={`${basePath}/${featured.slug}` || buildPostUrl(task, featured.slug)} task={task} />
                  {miniCards.map((post, index) => (
                    <ArchivePromoCard key={post.id || post.slug} post={post} href={`${basePath}/${post.slug}` || buildPostUrl(task, post.slug)} index={index} />
                  ))}
                </div>
              ) : null}

              {gridPosts.length ? (
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {gridPosts.map((post, index) => (
                    <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-[28px] border border-dashed border-[#d5ddf0] bg-white px-8 py-16 text-center shadow-[0_10px_24px_rgba(71,33,131,0.04)]">
              <Search className="mx-auto h-7 w-7 text-[#6e769b]" />
              <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-[#171a33]">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[#667094]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-xl border border-[#d7def2] bg-white px-5 py-3 font-semibold text-[#202542] hover:border-[#4b56d2]">Previous</Link> : null}
              <span className="rounded-xl border border-[#d7def2] bg-white px-5 py-3 font-semibold text-[#5f678d]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-xl border border-[#d7def2] bg-white px-5 py-3 font-semibold text-[#202542] hover:border-[#4b56d2]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function SnapshotTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/16 bg-white/10 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/74">{label}</p>
      <p className="mt-2 text-lg font-extrabold leading-tight text-white">{value}</p>
    </div>
  )
}

function ArchiveFeaturedCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#2f0f83_0%,#4b56d2_55%,#6f82e8_100%)] text-white shadow-[0_24px_56px_rgba(71,33,131,0.24)]">
      <div className="grid min-h-[280px] gap-5 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/88">
              {getCategory(post, task)}
            </span>
            <h2 className="mt-4 max-w-[15ch] text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] md:text-[3rem]">{post.title}</h2>
            <p className="mt-4 max-w-[42ch] text-sm leading-7 text-white/82">{getSummary(post) || 'Open the full page to explore details, media, and supporting information.'}</p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#ff7a00] px-5 py-3 text-sm font-bold text-white transition group-hover:translate-x-1">
            Explore now <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <img src={getImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        </div>
      </div>
    </Link>
  )
}

function ArchivePromoCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const tones = [
    'bg-[linear-gradient(180deg,#3277c8_0%,#2b60b8_100%)]',
    'bg-[linear-gradient(180deg,#5e64d8_0%,#4656b8_100%)]',
    'bg-[linear-gradient(180deg,#109070_0%,#0f7d64_100%)]',
  ]
  return (
    <Link href={href} className={`group relative min-h-[280px] overflow-hidden rounded-[24px] ${tones[index % tones.length]} p-5 text-white shadow-[0_18px_42px_rgba(71,33,131,0.16)]`}>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/74">{getCategory(post, 'Feature')}</p>
          <h3 className="mt-3 max-w-[10ch] text-[1.75rem] font-extrabold leading-[1.04] tracking-[-0.03em]">{post.title}</h3>
          <p className="mt-3 max-w-[16ch] text-sm leading-6 text-white/84">{getSummary(post).slice(0, 64) || 'Directory highlight'}</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 transition group-hover:translate-x-1">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      <img src={getImage(post)} alt="" className="pointer-events-none absolute bottom-0 right-0 h-[78%] w-[72%] object-cover transition duration-500 group-hover:scale-[1.04]" />
    </Link>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[24px] border border-[#d8dff1] bg-white shadow-[0_10px_24px_rgba(71,33,131,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(71,33,131,0.12)]">
      <img src={getImage(post)} alt={post.title} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">{getCategory(post, 'Article')} · #{String(index + 1).padStart(2, '0')}</p>
        <h2 className="mt-3 line-clamp-2 text-[1.55rem] font-extrabold leading-8 tracking-[-0.03em] text-[#181b36]">{post.title}</h2>
        <RatingRow post={post} />
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#667094]">{getSummary(post) || 'Open for the full write-up and related details.'}</p>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className="group flex gap-4 rounded-[24px] border border-[#d8dff1] bg-white p-5 shadow-[0_10px_24px_rgba(71,33,131,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(71,33,131,0.12)]">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#ecf1fd]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-9 w-9 text-[#7380aa]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">{getCategory(post, 'Listing')}</p>
        <h2 className="mt-2 line-clamp-2 text-[1.45rem] font-extrabold leading-8 tracking-[-0.03em] text-[#181b36]">{post.title}</h2>
        <RatingRow post={post} />
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#667094]">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#5f678d]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#4b56d2]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4 text-[#4b56d2]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4 text-[#4b56d2]" /> Website</span> : null}
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget']) || 'Open offer'
  const location = getField(post, ['location', 'address', 'city']) || 'Details inside'
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className="group rounded-[24px] border border-[#d8dff1] bg-white p-5 shadow-[0_10px_24px_rgba(71,33,131,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(71,33,131,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[2rem] font-extrabold tracking-[-0.04em] text-[#472183]">{price}</span>
        {condition ? <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4b56d2]">{condition}</span> : null}
      </div>
      <h2 className="mt-4 line-clamp-2 text-[1.4rem] font-extrabold leading-8 tracking-[-0.03em] text-[#181b36]">{post.title}</h2>
      <RatingRow post={post} />
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#667094]">{getSummary(post)}</p>
      <div className="mt-4 border-t border-[#e5ebf8] pt-4 text-sm font-medium text-[#5f678d]">{location}</div>
    </Link>
  )
}

function ImageArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[24px] border border-[#d8dff1] bg-white shadow-[0_10px_24px_rgba(71,33,131,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(71,33,131,0.12)]">
      <div className="relative">
        <img src={getImage(post)} alt={post.title} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#252949]">
          {getCategory(post, 'Image')}
        </span>
      </div>
      <div className="p-5">
        <h2 className="line-clamp-2 text-[1.35rem] font-extrabold leading-8 tracking-[-0.03em] text-[#181b36]">{post.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#667094]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className="group flex gap-4 rounded-[24px] border border-[#d8dff1] bg-white p-5 shadow-[0_10px_24px_rgba(71,33,131,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(71,33,131,0.12)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#eef2ff] text-[#4b56d2]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">{getCategory(post, 'Resource')}</p>
        <h2 className="mt-2 line-clamp-2 text-[1.2rem] font-extrabold leading-7 tracking-[-0.03em] text-[#181b36]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#667094]">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-sm font-semibold text-[#316bdb]">{website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p> : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group rounded-[24px] border border-[#d8dff1] bg-white p-5 shadow-[0_10px_24px_rgba(71,33,131,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(71,33,131,0.12)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eef2ff] text-[#4b56d2]">
        <FileText className="h-6 w-6" />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">{getCategory(post, 'Document')}</p>
      <h2 className="mt-2 line-clamp-2 text-[1.35rem] font-extrabold leading-8 tracking-[-0.03em] text-[#181b36]">{post.title}</h2>
      <RatingRow post={post} />
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#667094]">{getSummary(post)}</p>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className="group flex flex-col items-center rounded-[24px] border border-[#d8dff1] bg-white p-6 text-center shadow-[0_10px_24px_rgba(71,33,131,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(71,33,131,0.12)]">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#ecf1fd]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[#7280aa]" />}
      </div>
      <h2 className="mt-4 line-clamp-2 text-[1.3rem] font-extrabold leading-8 tracking-[-0.03em] text-[#181b36]">{post.title}</h2>
      {role ? <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">{role}</p> : null}
      <RatingRow post={post} />
      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#667094]">{getSummary(post)}</p>
    </Link>
  )
}
