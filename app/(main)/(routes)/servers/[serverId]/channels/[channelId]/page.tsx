import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChannelType } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";

import { MediaRoom } from "@/components/media-room";

interface ChannelIdPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const profile = await currentProfile();

  const { redirectToSignIn } = await auth();

  const { serverId, channelId } = await params;

  if (!profile) return redirectToSignIn();

  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
  });

  if (!channel || !member) redirect("/");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        serverId={serverId}
        name={channel.name}
        type="channel"
        imageUrl={profile.imageUrl}
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            name={channel.name}
            member={member}
            chatId={channelId}
            apiUrl={"/api/messages"}
            socketUrl={"/api/socket/messages"}
            socketQuery={{
              serverId,
              channelId,
            }}
            paramKey={"channelId"}
            paramValue={channelId}
            type={"channel"}
          />
          <ChatInput
            apiUrl="/api/socket/messages"
            query={{
              channelId: channelId,
              serverId: serverId,
            }}
            name={channel.name}
            type="channel"
          />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channelId} video={false} audio={true} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channelId} video={true} audio={false} />
      )}
    </div>
  );
};

export default ChannelIdPage;
