import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";

import { MediaRoom } from "@/components/media-room";

interface MemberIdPageProps {
  params: Promise<{
    serverId: string;
    memberId: string;
  }>;
  searchParams: Promise<{
    video?: boolean;
  }>;
}

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  const profile = await currentProfile();

  const { serverId, memberId } = await params;

  const { redirectToSignIn } = await auth();

  const { video } = await searchParams;

  if (!profile) return redirectToSignIn();

  const currentMember = await db.member.findFirst({
    where: {
      profileId: profile.id,
      serverId: serverId,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) return redirect("/");

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId
  );

  if (!conversation) return redirect(`/servers/${serverId}`);

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        serverId={serverId}
        name={otherMember.profile.name}
        type="conversation"
        imageUrl={otherMember.profile.imageUrl}
      />
      {video && (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      )}
      {!video && (
        <>
          <ChatMessages
            name={otherMember.profile.name}
            member={currentMember}
            chatId={conversation.id}
            apiUrl={"/api/direct-messages"}
            socketUrl={"/api/socket/direct-messages"}
            socketQuery={{
              conversationId: conversation.id,
            }}
            paramKey={"conversationId"}
            paramValue={conversation.id}
            type="conversation"
          />
          <ChatInput
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: conversation.id,
            }}
            name={otherMember.profile.name}
            type="conversation"
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;
