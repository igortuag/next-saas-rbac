import { ChevronsUpDown, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { getOrganizations } from '@/http/get-organizations';

export async function OrganizationSwitcher() {
  const { organizations } = await getOrganizations();

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
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {organizations.map((organization) => (
            <DropdownMenuItem key={organization.id}>
              <Avatar className="mr-2 size-4">
                <AvatarImage src={organization.avatarUrl}></AvatarImage>
              </Avatar>
              {organization.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={() => (
            <Link href="/create-organization">
              <PlusCircle className="size-4 mr-2" />
              Create New
            </Link>
          )}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
