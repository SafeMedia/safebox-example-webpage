import "./App.css";
import FileUpload from "./components/file-upload";
import FileDownload from "./components/file-download";
import { Button } from "./components/ui/button";
import { toast } from "sonner";

function App() {
    const handleCopy = (xorname: string) => {
        navigator.clipboard
            .writeText(xorname)
            .then(() => {
                toast("Copied Xorname", {
                    description: "Copied xorname to clipboard",
                });
            })
            .catch((err) => {
                toast("Failed Copy", {
                    description: "Failed to copy xorname",
                });
            });
    };

    return (
        <div>
            <div className="flex items-center pb-6">
                <img
                    src="/images/icon-128.png"
                    width={64}
                    alt="Icon"
                    className="mr-4"
                />
                <h1 className="font-roboto font-bold text-2xl">SafeBox</h1>
            </div>
            <div className="space-y-4 flex flex-col border rounded-xl p-4">
                <FileDownload />
                <hr className="-mx-4" />
                <FileUpload />
            </div>
            <div className="text-sm space-y-1 p-2 mt-1">
                <div className="flex justify-center">Copy example xornames</div>

                <div className="flex justify-center space-x-1">
                    <Button
                        size={"sm"}
                        onClick={() =>
                            handleCopy(
                                "e48244d5629d26399aa7b46a4f3bdfa052b69e37811209237a5a0d6ebdea6808"
                            )
                        }
                    >
                        Image
                    </Button>

                    <Button
                        size={"sm"}
                        onClick={() =>
                            handleCopy(
                                "22e34fe3ff69ebfaa26319606417777f059c35e64b036b4a16945e84f5b663ee"
                            )
                        }
                    >
                        Music
                    </Button>

                    <Button
                        size={"sm"}
                        onClick={() =>
                            handleCopy(
                                "b437029fcf8dacfeb4715b35d2c3da877200563dacadbf49ed396c84012aa667"
                            )
                        }
                    >
                        Video
                    </Button>
                </div>
            </div>
            <footer className="w-full rounded-md bg-gray-100 text-center py-4 mt-3">
                <p className="text-gray-500 text-sm">
                    Powered by{" "}
                    <a href="https://autonomi.com" target="_blank">
                        Autonomi
                    </a>
                </p>
            </footer>
        </div>
    );
}

export default App;
