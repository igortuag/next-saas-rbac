import { DropdownMenu, DropdownMenuTrigger } from './ui/dropdown-menu';

export function OrganizationSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-[164px] items-center gap-2 rounded p-1 text-sm font-medium outiline-none focus-visible:ring-2 focus-visible:ring-primary">
        <span>Select organization</span>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
