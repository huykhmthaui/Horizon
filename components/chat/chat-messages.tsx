"use client";

import { Member } from "@prisma/client";
import { format } from "date-fns";
import { Fragment, useRef, ComponentRef } from "react";
import { ChatItem } from "./chat-item";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";

import { Loader2, ServerCrash } from "lucide-react";
import { MessagesWithMemberWithProfile } from "@/types";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ComponentRef<"div">>(null);
  const bottomRef = useRef<ComponentRef<"div">>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });
  useChatSocket({ addKey, updateKey, queryKey });
  useChatScroll({
    chatRef,
    bottomRef,
    shouldLoad: !isFetchingNextPage && !!hasNextPage,
    fetchNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });

  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}

      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              disabled={!hasNextPage || isFetchingNextPage}
              onClick={() => fetchNextPage()}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transtition"
            >
              Load preivous messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, id) => (
          <Fragment key={id}>
            {group.items.map((message: MessagesWithMemberWithProfile) => (
              <ChatItem
                key={message.id}
                id={message.id}
                content={message.content}
                member={message.member}
                timeStamp={format(new Date(message.createdAt), DATE_FORMAT)}
                fileUrl={message.fileUrl}
                fileName={message.fileName}
                deleted={message.deleted}
                currentMember={member}
                isUpdated={message.updatedAt !== message.createdAt}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
