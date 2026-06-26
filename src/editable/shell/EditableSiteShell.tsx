import type { ReactNode } from 'react'
import { EditableNavbar } from '@/editable/shell/EditableNavbar'
import { EditableFooter } from '@/editable/shell/EditableFooter'
import { EditablePageMotion } from '@/editable/shell/EditablePageMotion'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads } from '@/lib/ads'

export function EditableSiteShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`editable-site-root ${dc.shell.page} flex min-h-screen flex-col ${className}`}>
      <EditableNavbar />
      <EditablePageMotion>{children}</EditablePageMotion>
      <div className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">
        <Ads slot="footer" showLabel className="mx-auto w-full" />
      </div>
      <EditableFooter />
    </div>
  )
}
