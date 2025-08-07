import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
import type { Entity } from '@/types/entities'

interface ComboboxProps {
  data: Entity[]
  type: string
  disabled?: boolean
  value?: string | number
  onChange?: (value: string) => void
  placeholder?: string
}

export function Combobox({ data, type, disabled = false, value, onChange, placeholder = 'Search...' }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // Find the selected item based on the value prop
  const selectedItem = data.find((item) => item.id.toString() === value?.toString())

  // Filter data based on search
  const filteredData = data.filter((item) => item.name.toLowerCase().includes(searchValue.toLowerCase()))

  const handleSelect = (selectedValue: string) => {
    const selectedItem = data.find((item) => item.id.toString() === selectedValue)

    if (selectedItem && onChange) {
      // Convert the id to string to ensure consistent type
      onChange(selectedItem.id.toString())
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
          disabled={disabled}
        >
          {selectedItem ? selectedItem.name : placeholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandInput placeholder={`Search ${type}...`} value={searchValue} onValueChange={setSearchValue} />
          <CommandEmpty>No {type} found.</CommandEmpty>
          <CommandGroup>
            {filteredData.map((item) => (
              <CommandItem key={item.id} value={item.id.toString()} onSelect={handleSelect}>
                <Check
                  className={cn('mr-2 h-4 w-4', value?.toString() === item.id.toString() ? 'opacity-100' : 'opacity-0')}
                />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
