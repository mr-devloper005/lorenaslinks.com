import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Building2,
  Camera,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[#f5f8ff] text-[#202542]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
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

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[2px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[#ff7a00] text-[#ff7a00]' : 'fill-[#dfe5f6] text-[#dfe5f6]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[#202542]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[#667094]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[#9aa3c3]" />
          <span className="text-sm text-[#667094]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#4b56d2] shadow-[0_8px_18px_rgba(71,33,131,0.05)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function HeroShell({ task, post, children }: { task: TaskKey; post: SitePost; children?: React.ReactNode }) {
  const image = getImages(post)[0]
  return (
    <section className="border-b border-[#dde3f5] bg-white">
      <div className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <BackLink task={task} />
        <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_420px]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4b56d2]">{categoryOf(post, getTaskConfig(task)?.label || task)}</p>
            <h1 className="mt-4 max-w-4xl text-balance text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#161a34] sm:text-[3.25rem]">
              {post.title}
            </h1>
            {leadText(post) ? <p className="mt-4 max-w-3xl text-base leading-8 text-[#667094]">{leadText(post)}</p> : null}
            {children}
          </div>
          <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#472183_0%,#4b56d2_55%,#82c3ec_100%)] p-3 shadow-[0_24px_52px_rgba(71,33,131,0.22)]">
            <div className="overflow-hidden rounded-[22px] bg-white/12">
              {image ? <img src={image} alt={post.title} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] w-full bg-white/10" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <>
      <HeroShell task="article" post={post}>
        <div className="mt-5 text-sm text-[#667094]">{SITE_CONFIG.name}</div>
      </HeroShell>
      <section className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <article className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)] sm:p-8">
          <BodyContent post={post} />
          <EditableArticleComments slug={post.slug} comments={comments} />
        </article>
      </section>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <>
      <HeroShell task="listing" post={post}>
        <DetailMeta post={post} category={categoryOf(post, 'Listing')} />
      </HeroShell>
      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <article className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)] sm:p-8">
            <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
            <Divider />
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Showcase" />
          </article>
          <aside className="space-y-6">
            {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
            <ContactAction website={website} phone={phone} email={email} />
            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const price = getField(post, ['price', 'amount', 'budget']) || 'Open offer'
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const images = getImages(post)
  return (
    <>
      <HeroShell task="classified" post={post}>
        <DetailMeta post={post} category={categoryOf(post, 'Classified')} />
      </HeroShell>
      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)]">
            <p className="text-[2.2rem] font-extrabold tracking-[-0.04em] text-[#472183]">{price}</p>
            {condition ? <BadgeLine label="Condition" value={condition} /> : null}
            {location ? <div className="mt-3"><BadgeLine label="Location" value={location} /></div> : null}
            <div className="mt-6">
              <ContactAction website={website} phone={phone} email={email} />
            </div>
          </aside>
          <article className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)] sm:p-8">
            <ImageStrip images={images} label="Offer gallery" large />
            <BodyContent post={post} />
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const gallery = getImages(post)
  return (
    <>
      <HeroShell task="image" post={post}>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-semibold text-[#4b56d2]">
          <Camera className="h-4 w-4" /> Image story
        </div>
      </HeroShell>
      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {(gallery.length ? gallery : ['/placeholder.svg?height=900&width=1200']).map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[24px] border border-[#d9e0f1] bg-white p-2 shadow-[0_10px_26px_rgba(71,33,131,0.06)]">
                <img src={image} alt="" className="w-full rounded-[18px] object-cover" />
              </figure>
            ))}
          </div>
          <aside className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)] sm:p-8">
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <HeroShell task="sbm" post={post}>
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff5a1f] px-5 py-3 text-sm font-bold text-white">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
      </HeroShell>
      <section className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <article className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)] sm:p-8">
          <BodyContent post={post} />
        </article>
      </section>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <>
      <HeroShell task="pdf" post={post}>
        <DetailMeta post={post} category={categoryOf(post, 'Document')} />
      </HeroShell>
      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <article className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)] sm:p-8">
            <BodyContent post={post} />
            {fileUrl ? (
              <div className="mt-8 overflow-hidden rounded-[24px] border border-[#dde4f6] bg-[#fbfcff]">
                <div className="flex items-center justify-between gap-3 border-b border-[#dde4f6] p-4">
                  <span className="text-sm font-semibold text-[#1e223f]">Document preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#4b56d2] px-4 py-2 text-xs font-semibold text-white">
                    Download <Download className="h-4 w-4" />
                  </Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-white" />
              </div>
            ) : null}
          </article>
          <aside className="space-y-6">
            {fileUrl ? (
              <div className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)]">
                <p className="text-lg font-extrabold tracking-[-0.02em] text-[#171a33]">Get this document</p>
                <p className="mt-3 text-sm leading-7 text-[#667094]">Open or download the full file in a new tab whenever you are ready.</p>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5a1f] px-5 py-3 text-sm font-bold text-white">
                  Download <Download className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
            <RelatedPanel task="pdf" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <HeroShell task="profile" post={post}>
        {role ? <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">{role}</p> : null}
        <DetailMeta post={post} center={false} />
      </HeroShell>
      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 text-center shadow-[0_10px_26px_rgba(71,33,131,0.06)] sm:p-8">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#edf2fe]">
              {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[#6f7ba5]" />}
            </div>
            <h2 className="mt-5 text-[1.6rem] font-extrabold tracking-[-0.03em] text-[#171a33]">{post.title}</h2>
            {role ? <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">{role}</p> : null}
            <DetailMeta post={post} center />
            <ContactAction website={website} email={email} bare />
          </aside>
          <article className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)] sm:p-8">
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

function Divider() {
  return <div className="my-8 h-px bg-[#e5ebf8]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content max-w-none text-[#283051] ${compact ? 'text-[15px] leading-7' : 'mt-2 text-[1.04rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[22px] border border-[#e1e8f6] bg-[#fbfcff] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#687196]"><Icon className="h-4 w-4 text-[#4b56d2]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-medium leading-7 text-[#1f2340]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[18px] border border-[#e1e8f6] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#d9e0f1] bg-white shadow-[0_10px_26px_rgba(71,33,131,0.06)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold text-[#1f2340]"><MapPin className="h-4 w-4 text-[#4b56d2]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#4b56d2] px-4 py-2.5 text-sm font-bold text-white">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-xl border border-[#d9e0f1] px-4 py-2.5 text-sm font-bold text-[#1f2340]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-xl border border-[#d9e0f1] px-4 py-2.5 text-sm font-bold text-[#1f2340]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-4 rounded-[18px] border border-[#e1e8f6] bg-[#fbfcff] px-4 py-3 text-sm">
      <span className="font-semibold uppercase tracking-[0.12em] text-[#687196]">{label}</span>
      <span className="font-bold text-[#1f2340]">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b56d2]">About this page</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[#667094]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[#4b56d2]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#4b56d2]" /> {SITE_CONFIG.name}</p>
          <p className="inline-flex items-center gap-2"><Bookmark className="h-4 w-4 text-[#4b56d2]" /> {categoryOf(post, 'Featured')}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[28px] border border-[#d9e0f1] bg-white p-6 shadow-[0_10px_26px_rgba(71,33,131,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#171a33]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-sm font-semibold text-[#4b56d2]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[#dde3f5] bg-white">
      <div className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[#171a33]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-bold text-[#4b56d2]">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[24px] border border-[#d8dff1] bg-white shadow-[0_10px_24px_rgba(71,33,131,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(71,33,131,0.12)]">
        <div className="overflow-hidden bg-[#ebf0fd]">
          {image ? <img src={image} alt="" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex aspect-[16/10] items-center justify-center"><FileText className="h-7 w-7 text-[#7580a8]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-base font-extrabold leading-7 tracking-[-0.02em] text-[#171a33]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#667094]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-[20px] border border-[#e1e7f6] p-3 transition hover:border-[#4b56d2]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[14px] object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] bg-[#edf2fe]"><FileText className="h-5 w-5 text-[#7580a8]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-bold leading-6 text-[#171a33]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#667094]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
