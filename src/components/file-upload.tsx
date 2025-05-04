import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function FileUpload() {
    const extensionId = import.meta.env.VITE_EXTENSION_ID;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file); // store the entire file object
        }
    };

    function requestClientUpload() {
        if (!chrome?.runtime?.sendMessage) {
            const description = (
                <span>
                    You can get the extension here:{" "}
                    <a
                        href="https://github.com/SafeMedia/safebox-chrome-extension"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        SafeBox Extension
                    </a>
                </span>
            );

            console.error("Chrome messaging API is not available.");
            toast("SafeBox Extension Not Installed", {
                description: description,
            });
            return;
        }
        if (!selectedFile) return;

        const CHUNK_SIZE = 1024 * 1024; // 1MB

        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);

            const totalChunks = Math.ceil(uint8Array.length / CHUNK_SIZE);

            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, uint8Array.length);
                const chunk = uint8Array.slice(start, end);

                chrome.runtime.sendMessage(
                    extensionId,
                    {
                        action: "triggerSafeBoxClientUploadChunk",
                        fileChunk: {
                            name: selectedFile.name,
                            mime_type: selectedFile.type,
                            chunkIndex: i,
                            totalChunks,
                            data: Array.from(chunk),
                        },
                    },
                    (response) => {
                        console.log("response: ", response);
                        if (response?.success) {
                            if (i === totalChunks - 1) {
                                toast("Success", {
                                    description:
                                        "Upload request received by client, please wait",
                                });
                            }
                        } else if (response.error == "Failed to fetch") {
                            const description = (
                                <span>
                                    Is your local client running?<br></br> Get
                                    it here:{" "}
                                    <a
                                        href="https://github.com/SafeMedia/SafeBoxClient"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        SafeBox Client
                                    </a>
                                </span>
                            );

                            toast("Failed To Upload", {
                                description,
                            });
                        } else {
                            toast("Error", {
                                description: response?.error ?? "Unknown error",
                            });
                        }
                    }
                );
            }
        };

        reader.readAsArrayBuffer(selectedFile);
    }

    return (
        <div className="space-y-3">
            <div className="flex">
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-r-none"
                >
                    Select
                </Button>

                <input
                    type="text"
                    readOnly
                    value={
                        selectedFile ? selectedFile.name : "No file selected"
                    }
                    placeholder="No file selected"
                    className="w-full rounded-r-md border border-input px-3 text-sm"
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="*/*" // ensures file type selection
                    multiple={false} // ensures only one file can be selected
                />
            </div>

            <Button
                onClick={requestClientUpload}
                disabled={!selectedFile}
                className="w-full"
            >
                Upload
            </Button>
        </div>
    );
}
