'use client'

import { Skeleton } from '@/components/ui/skeleton'

const MessageSkeletonCard = () => {
  return (
    <div className="w-full sm:w-[300px] lg:w-[340px] min-h-[220px] rounded-xl shadow-md border border-muted p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="flex justify-end">
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export default MessageSkeletonCard
