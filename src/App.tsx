import { BlogHeader } from "@/components/header";
// import { TabNavigation } from "@/components/tab";
import { BlogList } from "@/components/blogList";
// import { BlogPagination } from "@/components/pagination";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";

import { SuiClient } from "@mysten/sui/client";
import { bcs } from "@mysten/sui/bcs";
import {
  isValidSuiObjectId,
  isValidSuiAddress,
  fromHex,
  toHex,
} from "@mysten/sui/utils";
import baseX from "base-x";
import { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Post from "./components/Post";

const SUINK_PACKAGE = import.meta.env.VITE_CONTRACT_ADDRESS;
const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";
const b36 = baseX(BASE36);

type Suink = {
  id: string;
  name: string;
  metadata: string;
  b36addr: string;
  posts: object;
  pages: object;
};

const UID = bcs.fixedArray(32, bcs.u8()).transform({
  input: (id: string) => fromHex(id),
  output: (id) => toHex(Uint8Array.from(id)),
});

const SuinkStruct = bcs.struct("Suink", {
  id: UID,
  name: bcs.String,
  metadata: bcs.String,
  posts: bcs.map(bcs.Address, bcs.String),
  pages: bcs.map(bcs.Address, bcs.String),
});

export async function getSuink(objectId: string): Promise<object | null> {
  const client = new SuiClient({
    url: `https://fullnode.${import.meta.env.VITE_CONTRACT_ENV}.sui.io:443`,
  });
  const obj = await client.getObject({
    id: objectId,
    options: { showType: true, showContent: true },
  });

  console.log("suink object:", obj);

  if (
    obj.data &&
    obj.data.content &&
    obj.data.content.dataType === "moveObject" &&
    obj.data.type === suinkType()
  ) {
    return obj.data.content.fields;
  }

  return null;
}

function suinkType(): string {
  return SUINK_PACKAGE + "::suink::Suink";
}

type Path = {
  subdomain: string;
  path: string;
};

function getSubdomainAndPath(scope: string): Path | null {
  // At the moment we only support one subdomain level.
  const url = new URL(scope);
  const hostname = url.hostname.split(".");

  if (
    hostname.length === 3 ||
    (hostname.length === 2 && hostname[1] === "localhost")
  ) {
    // Accept only one level of subdomain eg `subdomain.example.com` or `subdomain.localhost` in
    // case of local development
    const path =
      url.pathname == "/" ? "/index.html" : removeLastSlash(url.pathname);
    return { subdomain: hostname[0], path } as Path;
  }
  return null;
}

/** Remove the last forward-slash if present
 * Resources on chain are only stored as `/path/to/resource.extension`.
 */
function removeLastSlash(path: string): string {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function subdomainToObjectId(subdomain: string): string | null {
  const objectId = "0x" + toHex(b36.decode(subdomain.toLowerCase()));
  console.log(
    "obtained object id: ",
    objectId,
    isValidSuiObjectId(objectId),
    isValidSuiAddress(objectId),
  );
  return isValidSuiObjectId(objectId) ? objectId : null;
}

function notFound() {
  // Display a not found message.
  const notFound = document.createElement("h2");
  notFound.innerText = "sorry, not a valid suink";
  // document.getElementById("picture").appendChild(notFound);
}

async function getWalrusJSON(hash: string) {
  const res = await fetch(
    `${import.meta.env.VITE_WALRUS_AGGREGATOR}/v1/${hash}`,
  );
  const result = await res.json();
  return result;
  console.log("test_header", result);
}

export default function App() {
  const [suink, setSuink] = useState<Suink>();
  const [suinkPostsObjectId, setSuinkPostsObjectId] = useState("");
  const url = window.location.origin;
  const parsedUrl = getSubdomainAndPath(url);

  useEffect(() => {
    if (!parsedUrl) {
      notFound();
      return;
    }

    const objectId = subdomainToObjectId(parsedUrl.subdomain);
    if (!objectId) {
      notFound();
      return;
    }

    getSuink(objectId).then((data: any) => {
      if (!data) {
        notFound();
        return;
      }
      setSuink(data as Suink);
      setSuinkPostsObjectId(data.posts.fields.id.id);
      console.log("suink: ", data);
      return data;
    });
  }, []);
  return (
    <Router>
      <div className="bg-background flex flex-col items-center">
        <main className="min-h-[calc(100vh-5.25rem)] w-full max-w-2xl px-8 py-8 space-y-8">
          {suink ? (
            <BlogHeader name={suink.name} metadata={suink.metadata} />
          ) : (
            <Skeleton className="w-full h-32" />
          )}
          <Routes>
            <Route
              path="/"
              element={<BlogList siteId={suinkPostsObjectId} />}
            />
            <Route path="/post/:id" element={<Post />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
