const PsetRow = ({
  name,
  value,
}: {
  name: string;
  value: string | boolean | number;
}) => {
  return (
    <div className="mb-2">
      <div className="justify-between px-2 min-h-[60px]">
        <div className="mb-2">
          <p className="font-bold text-secondary-foreground">{name}</p>
        </div>
        <p>{value || "-"}</p>
      </div>
    </div>
  );
};
export default PsetRow;
