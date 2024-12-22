import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

type MetadataType = {
  avatar: string;
  description: string;
  template: number;
};

export function BlogHeader({
  name,
  metadata,
}: {
  name: string;
  metadata: string;
}) {
  const [data, setData] = useState<MetadataType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_WALRUS_AGGREGATOR}/v1/${metadata}`,
      );
      const result: MetadataType = await res.json();
      console.log("test_header", result);
      if (result.avatar) {
      }
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [metadata]);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
        <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
        <div className="text-center md:text-left">
          <Skeleton className="w-32 h-8 mb-2" />
          <Skeleton className="w-64 h-20 mb-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
      <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-full">
        {data && data.avatar ? (
          <AvatarImage
            src={`https://aggregator.walrus-testnet.walrus.space/v1/${data.avatar}`}
            alt="Avatar"
          />
        ) : (
          <AvatarImage src="/imgs/suink.png" alt="Avatar" />
        )}
        <AvatarFallback>Suink</AvatarFallback>
      </Avatar>
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold">{name}</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          {data?.description
            ? data?.description
            : "This person is very lazy and left nothing."}
        </p>
      </div>
    </div>
  );
}
