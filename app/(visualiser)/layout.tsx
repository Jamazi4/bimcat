const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <div className=" flex flex-col overflow-hidden">{children}</div>;
};
export default layout;
