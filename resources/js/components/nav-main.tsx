import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({
    label,
    items,
}: {
    label?: string;
    items: NavItem[];
}) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            {label ? (
                <SidebarGroupLabel className="text-sidebar-foreground/50 px-3 pb-1.5 text-[11px] font-semibold tracking-wide uppercase">
                    {label}
                </SidebarGroupLabel>
            ) : null}
            <SidebarMenu>
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className="gap-2.5 rounded-lg px-3 py-2 transition-all duration-200 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center"
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && (
                                        <item.icon
                                            className={cn(
                                                'size-4 shrink-0 transition-colors duration-200',
                                                active && 'text-sidebar-primary',
                                            )}
                                        />
                                    )}
                                    <span className="flex-1">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
