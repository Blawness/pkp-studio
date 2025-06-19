
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarNav } from "@/components/layout/SidebarNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-col flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
