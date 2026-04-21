import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b border-border bg-card">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="p-6 space-y-6">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
