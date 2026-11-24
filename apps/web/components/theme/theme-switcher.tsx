import { Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu';

export function ThemeSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <Sun size={16} />
          </Button>
        }
      />
    </DropdownMenu>
  );
}
