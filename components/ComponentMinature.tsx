import Link from "next/link";

const ComponentMinature = ({ id, name }: { id: string; name: string }) => {
  return (
    <>
      <Link href={`/components/${id}`}>{name}</Link>
    </>
  );
};
export default ComponentMinature;
