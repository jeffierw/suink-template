import { getPostsList } from "@/lib/utils";
import { Skeleton } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const blogPosts = [
  "Introduction to Web3",
  "Understanding Blockchain Technology",
  "Decentralized Finance (DeFi) Explained",
  "The Rise of Non-Fungible Tokens (NFTs)",
  "Smart Contracts: A Beginner's Guide",
  "Cryptocurrency: Past, Present, and Future",
  "Exploring Decentralized Autonomous Organizations (DAOs)",
  "Web3 Development Tools and Frameworks",
  "The Impact of Web3 on Digital Identity",
  "Interoperability in the Blockchain Ecosystem",
  "Interoperability in the Blockchain Ecosystem",
  "Interoperability in the Blockchain Ecosystem",
  "Interoperability in the Blockchain Ecosystem",
];

export function BlogList({ siteId }: { siteId: string }) {
  console.log("test", siteId);
  const [isPending, setIsPending] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (siteId) {
      const fetchBlogList = async () => {
        try {
          setIsPending(true);
          const res: any = await getPostsList(siteId, null);
          console.log("res", res);
          if (res.nodes.length > 0) {
            setBlogPosts(res.nodes);
          }
        } catch (error) {
          console.log("error", error);
        } finally {
          setIsPending(false);
        }
      };
      fetchBlogList();
    }
  }, [siteId]);

  return isPending ? (
    <div className="space-y-6">
      {[...Array(5)].map((_, index) => (
        <Skeleton className="h-8 mx-auto max-w-2xl" key={index} />
      ))}
    </div>
  ) : (
    <div className="space-y-6">
      {blogPosts.length === 0 ? (
        <div className=" mt-40 flex flex-col space-y-4 justify-center items-center">
          <Icon icon="solar:ghost-bold" className="text-4xl text-gray-300" />
          <p className="text-gray-400 text-lg">No Post Yet</p>
        </div>
      ) : (
        blogPosts.map((post: any, index) => (
          <a
            onClick={() => navigate(`/post/${post.name.json}`)}
            className="block  underline cursor-pointer"
            key={index}
          >
            {post.value.json}
          </a>
        ))
      )}
    </div>
  );
}
