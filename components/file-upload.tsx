"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";

interface fileUploadProps {
    onChange: (url?: string, name?: string) => void;
    value: {url: string, name?: string} | string;
    endpoint: "imageUploader" | "messageFile";
}

const FileUpload = ({
    onChange,
    value,
    endpoint,
}: fileUploadProps) => {
    const fileType = typeof value === "object" ? value.name?.split(".").pop() : undefined;
    const url = typeof value === "object" ? value.url : value;

    if (url && fileType !== "pdf") {
        return (
            <div className="relative h-40 w-40">
                <Image
                    fill
                    src={typeof value === "object" ? value.url : ""}
                    alt="Upload"
                    sizes="(max-width: 768px) 30vw, (max-width: 1200px) 33vw, 21vw"
                />
                <button
                    onClick={() => onChange("")}
                    className="absolute bg-rose-500 text-white p-1 rounded-full -top-3 -right-3.5 shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    if (url && fileType === "pdf") {
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <FileIcon
                    className="h-10 w-10 fill-indigo-200 stroke-indigo-400"
                />
                <a
                    href={typeof value === "object" ? value.url : ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                    {typeof value === "object" ? value.name : ""}
                </a>
                <button
                    onClick={() => onChange("")}
                    className="absolute bg-rose-500 text-white p-1 rounded-full -top-3 -right-3.5 shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    if (url && endpoint !== "messageFile") {
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill
                    src={typeof value === "object" ? value.url : ""}
                    alt="Upload"
                    sizes="(max-width: 768px) 30vw, (max-width: 1200px) 33vw, 21vw"
                    className="rounded-full"
                />
                <button
                    onClick={() => onChange("")}
                    className="absolute bg-rose-500 text-white p-1 rounded-full top-0 right-0 shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    return (
        <UploadDropzone
            appearance={{ container: "dark:border-white/40", label: "dark:text-white/70", allowedContent: "dark:text-white/70" }}
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                const fileUrl = res?.[0].ufsUrl;
                const fileName = res?.[0].name;
                onChange(fileUrl, fileName);
            }}
            onUploadError={(error) => {
                console.log(error);
            }}
        />
    )
}

export default FileUpload;