"use client";

import qs from "query-string";
import { useState } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { MemberRole } from "@prisma/client";
import { useRouter } from "next/navigation";

const roleIconMap = {
  GUEST: <User className="h-4 w-4 text-indigo-500" />,
  MODERATOR: <ShieldCheck className="h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
};

export const MembersModal = () => {
  const router = useRouter();
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const [loadingId, setLoadingId] = useState("");

  const isModalOpen = isOpen && type === "members";
  const { server } = data as { server: ServerWithMembersWithProfiles };

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: {
          serverId: server?.id,
        },
      });

      const response = await axios.delete(url);

      router.refresh();
      setTimeout(() => onOpen("members", { server: response.data }), 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: {
          serverId: server?.id,
        },
      });

      const response = await axios.patch(url, { role });

      router.refresh();
      setTimeout(() => onOpen("members", { server: response.data }), 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-white text-black dark:bg-[#313338] dark:text-white overflow-hidden"
        aria-describedby={undefined}
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map((member) => (
            <div key={member.id} className="flex items-center gap-x-2 mb-6">
              <UserAvatar src={member.profile.imageUrl} />
              <div className="flex flex-col gap-y-1">
                <div className="text-xs font-semibold flex items-center gap-x-1">
                  {member.profile.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {member.profile.email}
                </p>
              </div>
              {server.profileId !== member.profileId &&
                loadingId !== member.id && (
                  <div className="ml-auto">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button>
                          <MoreVertical className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-64 p-0" align="end">
                        <Command>
                          <CommandGroup heading="Role">
                            <CommandItem
                              onSelect={() =>
                                onRoleChange(member.id, "MODERATOR")
                              }
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Moderator
                              {member.role === "MODERATOR" && (
                                <Check className="h-4 w-4 ml-auto" />
                              )}
                            </CommandItem>
                            <CommandItem
                              onSelect={() => onRoleChange(member.id, "GUEST")}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Guest
                              {member.role === "GUEST" && (
                                <Check className="h-4 w-4 ml-auto" />
                              )}
                            </CommandItem>
                          </CommandGroup>
                          <CommandGroup>
                            <CommandItem onSelect={() => onKick(member.id)}>
                              <Gavel className="h-4 w-4 mr-2 text-rose-500" />
                              Kick
                            </CommandItem>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              {loadingId === member.id && (
                <Loader2 className="animate-spin text-zinc-500 ml-auto h-4 w-4 dark:text-zinc-400" />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
