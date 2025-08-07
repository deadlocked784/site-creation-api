import { Loader } from 'lucide-react'

export const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader className="animate-spin text-gray-500" size={24} />
        </div>
    )
}