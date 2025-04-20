import { useEffect, useState } from "react";

interface ChatScrollProps {
  chatRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  shouldLoad: boolean;
  fetchNextPage: () => void;
  count: number;
}

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoad,
  fetchNextPage,
  count
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const topDiv = chatRef?.current;

    const handleScroll = () => {
      const scrollTop = topDiv?.scrollTop;
      if (scrollTop === 0 && shouldLoad) {
        fetchNextPage();
      }
    };

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      topDiv?.removeEventListener("scroll", handleScroll);
    }
  }, [shouldLoad, fetchNextPage, chatRef]);

  useEffect(() => {
    const topDiv = chatRef?.current;
    const bottomDiv = bottomRef?.current;
    const shouldAutoScroll = () => {
        if(!hasInitialized && bottomDiv) {
          setHasInitialized(true);
          return true;
        }

        if(!topDiv) return false;

        const distanceFromBottom = topDiv.scrollHeight - topDiv.clientHeight - topDiv.scrollTop;
        return distanceFromBottom <= 100;
    }

    if (shouldAutoScroll()) {
      setTimeout(() => {
        bottomRef?.current?.scrollIntoView({
            behavior: "smooth",
        });
      }, 100);
    }
  }, [count, chatRef, bottomRef, hasInitialized]);
};
