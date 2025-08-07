import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  content: React.ReactNode
}

export function CustomTooltip({ content }: Props) {
  if (!content) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className='text-muted-foreground ml-1 inline h-4 w-4' />
        </TooltipTrigger>
        <TooltipContent className='max-w-xs'>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
