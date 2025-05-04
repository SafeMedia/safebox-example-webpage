import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { fileTypeFromBuffer } from "file-type";

export default function FileDownload() {
    const extensionId = import.meta.env.VITE_EXTENSION_ID;
    const [xorname, setXorname] = useState("");

    function isValidXorname(input: string): boolean {
        const regex = /^[a-z0-9]{64}$/;
        return regex.test(input);
    }

    function requestClientDownload() {
        if (!xorname) return;

        if (!chrome?.runtime?.sendMessage) {
            const description = (
                <span>
                    You can get the extension here:{" "}
                    <a
                        href="https://github.com/SafeMedia/autonomi-chrome-extension"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        Extension
                    </a>
                </span>
            );

            console.error("Chrome messaging API is not available.");
            toast("Extension Not Installed", {
                description,
            });
            return;
        }

        toast("Download Requested", {
            description: "Download request has started, please wait",
        });

        chrome.runtime.sendMessage(
            extensionId,
            { action: "triggerSafeBoxClientDownload", xorname },
            (response) => {
                if (response.success) {
                    toast("Success", {
                        description: "Download request complete",
                    });

                    if (response.success && response.data) {
                        const byteArray = new Uint8Array(response.data);

                        fileTypeFromBuffer(byteArray)
                            .then((typeInfo) => {
                                const mimeType =
                                    typeInfo?.mime ||
                                    "application/octet-stream";
                                const fileBlob = new Blob([byteArray], {
                                    type: mimeType,
                                });

                                const fileUrl = URL.createObjectURL(fileBlob);

                                if (fileBlob.type.startsWith("image/")) {
                                    const newWindow = window.open("", "_blank");
                                    if (newWindow) {
                                        newWindow.document.write(`
                                            <html>
                                                <head><title>Image Preview</title></head>
                                                <body>
                                                    <img src="${fileUrl}" alt="Downloaded Image" style="max-width: 100%; height: auto;">
                                                </body>
                                            </html>
                                        `);
                                        newWindow.document.close();
                                    }
                                } else if (fileBlob.type.startsWith("audio/")) {
                                    const newWindow = window.open("", "_blank");
                                    if (newWindow) {
                                        newWindow.document.write(`
                                            <html>
                                                <head><title>Audio Preview</title></head>
                                                <body>
                                                    <audio controls>
                                                        <source src="${fileUrl}" type="${fileBlob.type}">
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                </body>
                                            </html>
                                        `);
                                        newWindow.document.close();
                                    }
                                } else if (fileBlob.type.startsWith("video/")) {
                                    const newWindow = window.open("", "_blank");
                                    if (newWindow) {
                                        newWindow.document.write(`
                                            <html>
                                                <head><title>Video Preview</title></head>
                                                <body>
                                                    <video controls width="100%" height="auto">
                                                        <source src="${fileUrl}" type="${fileBlob.type}">
                                                        Your browser does not support the video element.
                                                    </video>
                                                </body>
                                            </html>
                                        `);
                                        newWindow.document.close();
                                    }
                                } else {
                                    console.warn(
                                        "Blob is not a media type:",
                                        fileBlob.type
                                    );
                                }
                            })
                            .catch((err) => {
                                console.error(
                                    "Failed to detect MIME type:",
                                    err
                                );
                            });
                    }
                } else if (response.error === "Failed to fetch") {
                    const description = (
                        <span>
                            Is your local client running?
                            <br />
                            Get it here:{" "}
                            <a
                                href="https://github.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                            >
                                Client
                            </a>
                        </span>
                    );
                    toast("Failed To Download", { description });
                } else {
                    toast("Error", {
                        description: response.error ?? "Unknown error",
                    });
                }
            }
        );
    }

    return (
        <div className="space-y-3">
            <Input
                type="text"
                placeholder="Enter xorname"
                value={xorname}
                onChange={(e) => setXorname(e.target.value)}
            />
            <Button
                onClick={requestClientDownload}
                disabled={!xorname.trim() || !isValidXorname(xorname)}
                className="w-full"
            >
                Download
            </Button>
        </div>
    );
}
