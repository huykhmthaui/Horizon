import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { currentProfile } from "@/lib/current-profile"
import { redirect } from "next/navigation";

interface ServerIdPageProps {
    params: {
        serverId: string
    }
};

const ServerIdPage = async ({
    params
}: ServerIdPageProps
) => {
    const profile = await currentProfile();

    const { redirectToSignIn } = await auth();

    const { serverId } = await params;

    if (!profile) return redirectToSignIn();

    const server = await db.server.findUnique({
        where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        },
        include: {
            channels: {
                where: {
                    name: "general"
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })

    const initialChannel = server?.channels[0];

    if (initialChannel?.name !== "general") return null;

    return redirect(`/servers/${serverId}/channels/${initialChannel?.id}`);
}

export default ServerIdPage;