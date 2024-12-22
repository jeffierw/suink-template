import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { suiClient, suiGraphQLClient } from "@/networkConfig";
import { graphql } from "@mysten/sui/graphql/schemas/2024.4";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getObject = async (id: string) => {
  const res = await suiClient.getObject({
    id,
    options: {
      showContent: true,
      showOwner: true,
    },
  });
  return res.data || [];
};

export const getPostsList = async (
  tableId: string,
  endCursor: string | null = null,
) => {
  const query = graphql(`
    query($endCursor: String) {
      owner(address: "${tableId}") {
        dynamicFields(
          first: 50
          after: $endCursor
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            name {
              json
            }
            value {
              ... on MoveValue {
                json
              }
            }
          }
        }
      }
    }
  `);
  const result = await suiGraphQLClient.query({
    query,
    variables: { endCursor },
  });
  return {
    nodes: result.data?.owner?.dynamicFields?.nodes,
    pageInfo: result.data?.owner?.dynamicFields?.pageInfo,
  };
};

export async function operateData(response: any) {
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader?.read()!;
    if (value) {
      chunks.push(value);
    }
    done = readerDone;
  }

  // 将 Uint8Array[] 转换为单个 Uint8Array
  const combinedChunks = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0),
  );
  let offset = 0;
  for (const chunk of chunks) {
    combinedChunks.set(chunk, offset);
    offset += chunk.length;
  }

  // 1. 将数据转换为文本
  const text = new TextDecoder().decode(combinedChunks);
  const res = JSON.parse(text);
  return res;
}
