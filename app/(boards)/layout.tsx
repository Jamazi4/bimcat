export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="
        mt-[92px]
        max-w-7xl
        mx-auto
        px-4
        flex
        flex-col
        min-h-[calc(100vh-200px)]
      "
    >
      <div className="flex-grow">{children}</div>

      <h4
        className="
          text-center
        "
      >
        This is a demo project. All your data might get removed.
      </h4>
    </div>
  );
}
