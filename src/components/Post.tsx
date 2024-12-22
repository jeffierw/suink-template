import { getObject, operateData } from "@/lib/utils";
import { Skeleton } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const Post = () => {
  const { id } = useParams<{ id: string }>(); // 获取 id 参数
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishAt, setPublishAt] = useState("");

  useEffect(() => {
    if (id) {
      const fetchObject = async () => {
        setIsPending(true);
        try {
          const res: any = await getObject(id);
          console.log("test", res);
          if (
            res &&
            res.owner &&
            res?.content.type ===
              `${import.meta.env.VITE_CONTRACT_ADDRESS}::post::Post`
          ) {
            const walrusData = await fetch(
              `${import.meta.env.VITE_WALRUS_AGGREGATOR}/v1/${res?.content?.fields?.content}`,
            );
            const JSONData = await operateData(walrusData);
            console.log("Fetched JSON Data:", JSONData);
            setTitle(JSONData.title);
            setContent(JSONData.content);
            const date = new Date(Number(res?.content?.fields?.published_at));
            console.log("test", date);

            const formattedDate = date.toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            setPublishAt(formattedDate);
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        } finally {
          setIsPending(false);
        }
      };
      fetchObject();
    }
  }, [id]);

  return (
    <>
      {isPending ? (
        <>
          <Skeleton className="h-8 mx-auto max-w-2xl" />
          <Skeleton className="h-4 mx-auto max-w-2xl" />
          <Skeleton className="h-screen mx-auto max-w-2xl" />
        </>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <h1 className="text-sm text-slate-500 mb-4">{publishAt}</h1>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </>
  );
};

export default Post;
