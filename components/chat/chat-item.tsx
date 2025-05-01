"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import qs from "query-string";
import { cn } from "@/lib/utils";

import Image from "next/image";
import { Member, MemberRole } from "@prisma/client";
import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { MemberWithProfile } from "@/types";

import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Edit,
    FileIcon,
    ShieldAlert,
    ShieldCheck,
    Trash,
    User
} from "lucide-react";

interface ChatItemProps {
    id: string;
    content: string;
    member: MemberWithProfile;
    timeStamp: string;
    fileUrl: string | null;
    fileName: string | null;
    deleted: boolean;
    currentMember: Member;
    isUpdated: boolean;
    socketUrl: string;
    socketQuery: Record<string, string>;
}

const roleIconMap = {
    "GUEST": <User className="h-4 w-4 ml-2 text-indigo-500" />,
    "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    "ADMIN": <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
}

const formSchema = z.object({
    content: z.string().min(1)
});

export const ChatItem = ({
    id,
    content,
    member,
    timeStamp,
    fileUrl,
    fileName,
    deleted,
    currentMember,
    isUpdated,
    socketUrl,
    socketQuery
}: ChatItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const { onOpen } = useModal();
    const router = useRouter();
    const params = useParams();

    const onMemberClick = () => {
        if (member.id === currentMember.id) {
            return;
        }

        router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" || event.code === 'Escape') setIsEditing(false);
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [content]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${id}`,
                query: socketQuery
            });

            await axios.patch(url, values);

            form.reset();
            setIsEditing(false);
        } catch (error) {
            console.log(error);
        }
    }

    const fileType = fileName?.split(".").pop();

    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
    const canEditMessage = !deleted && isOwner && !fileUrl;
    const isPDF = fileType === "pdf" && fileUrl;
    const isImage = !isPDF && fileUrl;

    return (
        <div className="relative group flex items-center w-full hover:bg-black/5 p-4 transition">
            <div className="group flex items-start w-full gap-x-2">
                <div
                    onClick={onMemberClick}
                    className="cursor-pointer hover:drop-shadow-md transition"
                >
                    <UserAvatar src={member.profile.imageUrl} />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2">
                        <div
                            onClick={onMemberClick}
                            className="flex items-center"
                        >
                            <p className="font-semibold text-sm hover:underline cursor-pointer">
                                {member.profile.name}
                            </p>
                            <ActionTooltip label={member.role}>
                                {roleIconMap[member.role]}
                            </ActionTooltip>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {timeStamp}
                        </span>
                    </div>
                    {isImage && (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative flex items-center h-48 w-48 bg-secondary
                                aspect-square rounded-md mt-2 overflow-hidden border"
                        >
                            <Image
                                src={fileUrl}
                                alt={content}
                                fill
                                className="object-cover"
                            />
                        </a>
                    )}
                    {isPDF && (
                        <div className="relative flex items-center w-fit p-2 mt-2 rounded-md bg-background/10">
                            <FileIcon
                                className="h-10 w-10 fill-indigo-200 stroke-indigo-400"
                            />
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                            >
                                {fileName}
                            </a>
                        </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className={cn(
                            "text-sm text-zinc-600 dark:text-zinc-300",
                            deleted && "italic text-xs mt-1 text-zinc-500 dark:text-zinc-400"
                        )}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                                    (edited)
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <Form {...form}>
                            <form
                                className="flex items-center w-full gap-x-2 pt-2"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <div className="relative w-full">
                                                    <Input
                                                        disabled={isLoading}
                                                        className="p-2 bg-zinc-200/70 dark:bg-zinc-700/75 text-zinc-600 dark:text-zinc-200
                                                        border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                        placeholder="Edited message"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button disabled={isLoading} size="sm" variant="primary">
                                    Save
                                </Button>
                            </form>
                            <span className="text-[10px] mt-1 text-zinc-400">
                                Press escape to cancel, enter to save
                            </span>
                        </Form>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div className="absolute hidden items-center p-1 -top-2 right-5 bg-white dark:bg-zinc-800
                    gap-x-2 group-hover:flex border rounded-sm">
                    {canEditMessage && (
                        <ActionTooltip label="Edit">
                            <Edit
                                onClick={() => setIsEditing(true)}
                                className="h-4 w-4 ml-auto text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300
                                cursor-pointer transtion"
                            />
                        </ActionTooltip>
                    )}
                    <ActionTooltip label="Delete">
                        <Trash
                            onClick={() => onOpen("deleteMessage", { apiUrl: `${socketUrl}/${id}`, query: socketQuery })}
                            className="h-4 w-4 ml-auto text-rose-400 hover:text-rose-500
                                cursor-pointer transtion"
                        />
                    </ActionTooltip>
                </div>
            )}
        </div>
    )
}