import { Loader2 } from "lucide-react";

const LoadingIndicator = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="animate-spin" />
        </div>
    )
}

export default LoadingIndicator;