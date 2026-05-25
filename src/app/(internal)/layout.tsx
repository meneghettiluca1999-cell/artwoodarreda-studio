import { Sidebar } from "@/components/layout/sidebar";

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Global App Header */}
      <header className="sticky top-0 z-50 w-full bg-black text-white shrink-0">
        <div className="container flex h-16 max-w-screen-2xl items-center px-8 mx-auto">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center py-2" href="/dashboard">
              <img src="/logo.png" alt="Artwoodarreda" className="block h-6 md:h-7 object-contain" />
            </a>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
