import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'Reading desk',
    headline: 'Long-form articles with a calmer editorial rhythm.',
    description: 'Use this page for essays, guides, explainers, and story-led posts. The layout should feel like a publication, not a directory.',
    filterLabel: 'Choose article topic',
    secondaryNote: 'Reading surfaces need space, hierarchy, and fewer distractions.',
    chips: ['Editorial pacing', 'Topic filters', 'Long-read friendly'],
  },
  classified: {
    eyebrow: 'Notice board',
    headline: 'Fast-moving classifieds, offers, and time-sensitive posts.',
    description: 'Classified content should feel quick to scan, practical, and action-oriented with less editorial decoration.',
    filterLabel: 'Filter classified category',
    secondaryNote: 'Prioritize urgency, short summaries, and direct browsing.',
    chips: ['Fast scan', 'Offers', 'Action cues'],
  },
  sbm: {
    eyebrow: 'Saved resources',
    headline: 'Social bookmarks arranged like curated collections.',
    description: 'Bookmark pages should feel like shelves of useful resources, tools, references, and collections.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Curated resources need grouping and calm metadata.',
    chips: ['Collections', 'Resources', 'Reference flow'],
  },
  profile: {
    eyebrow: 'People and profiles',
    headline: 'Profiles arranged like discoverable directory cards.',
    description: 'Give visitors a bright, easy-to-scan overview with identity cues, visual hierarchy, and quick paths into each page.',
    filterLabel: 'Filter profile category',
    secondaryNote: 'Make identity and credibility visible before the grid begins.',
    chips: ['Identity first', 'Trust cues', 'Creator/business cards'],
  },
  pdf: {
    eyebrow: 'Document library',
    headline: 'PDFs and documents presented as a useful library.',
    description: 'PDF pages should feel like downloadable guides, reports, files, and reference material instead of normal articles.',
    filterLabel: 'Filter document type',
    secondaryNote: 'Document surfaces need archive cues, file context, and clear browsing.',
    chips: ['Documents', 'Guides', 'Archive ready'],
  },
  listing: {
    eyebrow: 'Business directory',
    headline: 'Listings built like a modern browse-first directory.',
    description: 'Keep the layout practical and high-signal with strong summaries, quick metadata, and clear compare-friendly cards.',
    filterLabel: 'Filter business category',
    secondaryNote: 'Prioritize comparison, location, and direct action paths.',
    chips: ['Directory', 'Compare', 'Business discovery'],
  },
  image: {
    eyebrow: 'Visual gallery',
    headline: 'Image pages with visual-first discovery and poster-like cards.',
    description: 'Lead with cover imagery, clean grids, and compact supporting details so the visuals stay in control.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Let images carry the page before long text does.',
    chips: ['Gallery', 'Visual-first', 'Portfolio mood'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
