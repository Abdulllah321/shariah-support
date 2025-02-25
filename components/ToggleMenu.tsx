import {usePathname} from 'next/navigation';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection,
} from '@heroui/dropdown';
import {User} from "@heroui/user";
import {Divider} from "@heroui/react";
import {
    FileText,
    Link,
    Briefcase,
    List,
    BookOpen,
    Activity,
    Shield,
    Users,
    TrendingUp,
    LogOut,
    EllipsisVertical
} from 'lucide-react';

export interface UserType {
    employeeId: string;
    username: string;
}

interface ToggleMenuProps  {
    user: UserType;
    handleLogout: () => void
}
export default function ToggleMenu({user, handleLogout}:ToggleMenuProps) {
    const pathname = usePathname();

    const knowledgeItems = [
        {key: 'process-flow', label: 'Process Flow', href: '/process-flow', icon: Activity},
        {key: 'session-link', label: 'Session Link', href: '/session-link', icon: Link},
        {key: 'chamber-of-commerce', label: 'Chamber of Commerce', href: '/chamber-of-commerce', icon: Briefcase},
        {key: 'branches-list', label: 'Branches List', href: '/branches-list', icon: List},
        {key: 'madaris-list', label: 'Madaris List', href: '/madaris-list', icon: BookOpen},
    ];

    const reportItems = [
        {key: 'daily-activity-record', label: 'Daily Activity Record', href: '/daily-activity', icon: FileText},
        {key: 'branch-shariah-review', label: 'Branch Shariah Review', href: '/branch-review', icon: Shield},
        {key: 'staff-interview', label: 'Staff Interview', href: '/staff-interview', icon: Users},
        {key: 'lead-360', label: 'Lead 360', href: '/leads', icon: TrendingUp},
    ];


    const logoutItem = {
        key: 'logout',
        label: 'Logout',
        icon: LogOut,
        action: () => {
            handleLogout();
        },
    };

    return (
        <Dropdown>
            <DropdownTrigger aria-label="Menu">
                <EllipsisVertical/>
            </DropdownTrigger>
            <DropdownMenu aria-label="Main Menu" variant="shadow" color="primary" topContent={<div className={'pt-3 pb-1'}>
                <User name={user?.username || "User"}
                      description={`#${user?.employeeId}`}
                />
                <Divider className={'mt-3 '}/>
            </div>
            }>

                {/* Report Items Section */}
                <DropdownSection title="Report Items" showDivider>
                    {reportItems.map((item) => (
                        <DropdownItem
                            key={item.key}
                            href={item.href}
                            className={pathname === item.href ? "bg-primary shadow-white shadow-sm" : "bg-transparent"}
                            startContent={<item.icon className="mr-2 h-4 w-4"/>}
                        >
                            {item.label}
                        </DropdownItem>
                    ))}

                </DropdownSection>

                {/* Knowledge Centre Section */}
                <DropdownSection title="Knowledge Centre" showDivider>
                    {knowledgeItems.map((item) => (
                        <DropdownItem
                            key={item.key}
                            className={pathname === item.href ? "bg-primary shadow-white shadow-sm" : "bg-transparent"}
                            href={item.href} startContent={<item.icon className="mr-2 h-4 w-4"/>}
                        >
                            {item.label}

                        </DropdownItem>
                    ))}
                </DropdownSection>

                {/* Bottom Content: Logout */}
                <DropdownItem
                    key={logoutItem.key}
                    className="text-danger"
                    startContent={<logoutItem.icon className="mr-2 h-4 w-4"/>
                    }
                    onPress={logoutItem.action}
                >

                    {logoutItem.label}
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
