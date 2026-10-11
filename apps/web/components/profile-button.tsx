import { ChevronDown, Link, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import Link from 'next/link';

export function ProfileButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">Igor Tuag</span>
          <span className="text-xs text-muted-foreground">
            igor.tuag@example.com
          </span>
        </div>
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Igor Tuag" />
          <AvatarFallback>IT</AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={() => (
            <Link href="/api/auth/sign-out">
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Link>
          )}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
