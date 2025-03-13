export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mt-12 max-w-[1024px] mx-auto mb-4 w-auto px-4 justify-center flex flex-col ">
      {children}
    </div>
  );
}
