import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    };
};

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
    const profile = await currentProfile();

    const { redirectToSignIn } = await auth();

    const inviteCode = await params.inviteCode;

    if (!profile) return redirectToSignIn();

    if (!inviteCode) return redirect("/");

    const existedServer = await db.server.findFirst({
        where: {
            inviteCode: inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    if (existedServer) return redirect(`/servers/${existedServer.id}`);

    const server = await db.server.update({
        where: {
            inviteCode: inviteCode,
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id,
                    }
                ]
            }
        }
    })

    if (server) return redirect(`/servers/${server.id}`);

    return (
        <div>
            Hello
        </div>
    );
}

export default InviteCodePage;