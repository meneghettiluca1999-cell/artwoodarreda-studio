export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-accent-foreground font-sans">
      {children}
    </div>
  );
}
