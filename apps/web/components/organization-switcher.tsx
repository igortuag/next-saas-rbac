import { ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarImage } from './ui/avatar';

export function OrganizationSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-[168px] items-center gap-2 rounded p-1 text-sm font-medium outiline-none focus-visible:ring-2 focus-visible:ring-primary">
        <span>Select organization</span>
        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        alignOffset={16}
        sideOffset={12}
        className="w-[200px]"
      >
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuItem>
          <Avatar className="mr-2 size-5">
            <AvatarImage src="https://via.placeholder.com/150"></AvatarImage>
          </Avatar>
          Organization 1
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
