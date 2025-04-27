const page = async ({ params }: { params: Promise<{ sharedId: string }> }) => {
  const { sharedId } = await params;
  console.log(sharedId);
  return <div>page</div>;
};
export default page;
