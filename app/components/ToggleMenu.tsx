import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { User } from "@heroui/user";
import { Divider } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { getMenuSections, MenuItem, MenuSection } from "@/constants/menuData";
import Link from "next/link";

export interface UserType {
  employeeId: string;
  username: string;
}

interface ToggleMenuProps {
  user: UserType;
  handleLogout: () => void;
}

export default function ToggleMenu({ user, handleLogout }: ToggleMenuProps) {
  const pathname = usePathname();

  // Memoize menu data to avoid unnecessary recalculations
  const menuSections = useMemo(
    () => getMenuSections(handleLogout),
    [handleLogout]
  );

  return (
    <Dropdown>
      <DropdownTrigger aria-label="Menu" id={"dropdown-menu-button"}>
        <EllipsisVertical />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Main Menu"
        topContent={
          <div className="pt-3 pb-1">
            <User
              name={user?.username || "User"}
              description={`#${user?.employeeId}`}
            />
            <Divider className="mt-3" />
          </div>
        }
      >
        {menuSections.map(({ title, items }: MenuSection, index: number) => (
          <DropdownSection key={index} title={title!} showDivider={!!title}>
            {items.map(
              ({
                key,
                label,
                href,
                icon: Icon,
                action,
                className,
              }: MenuItem) => {
                const isActive = href ? pathname.startsWith(href) : false;

                return (
                  <Link href={href!} key={key}>
                    <DropdownItem
                      key={key}
                      onPress={action}
                      className={
                        className ||
                        (isActive
                          ? "bg-primary shadow-foreground shadow-sm text-white"
                          : "bg-transparent")
                      }
                      startContent={<Icon className="mr-2 h-4 w-4" />}
                    >
                      {label}
                    </DropdownItem>
                  </Link>
                );
              }
            )}
          </DropdownSection>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
