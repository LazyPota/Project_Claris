export default function RootTemplate({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="pt-[64px] *:min-h-[calc(100dvh-115px)]">
      {children}
    </div>
  );
}
