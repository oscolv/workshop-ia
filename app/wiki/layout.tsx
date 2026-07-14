import { WikiSidebar } from '@/components/wiki/WikiSidebar'

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
      <div className="hidden md:block">
        <WikiSidebar />
      </div>
      <div>{children}</div>
    </div>
  )
}
