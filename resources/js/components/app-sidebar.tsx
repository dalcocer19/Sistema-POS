import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Boxes,
    FolderGit2,
    LayoutGrid,
    List,
    ReceiptText,
    ShoppingCart,
    Warehouse,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as inventoryIndex } from '@/routes/inventory';
import { index as categoriesIndex } from '@/routes/categories';
import { create as posCreate } from '@/routes/pos';
import { index as productsIndex } from '@/routes/products';
import { index as salesIndex } from '@/routes/sales';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const teamSlug = page.props.currentTeam?.slug ?? '';
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        ...(page.props.permissions?.canSell
            ? [
                  {
                      title: 'Nueva venta',
                      href: posCreate(teamSlug),
                      icon: ShoppingCart,
                  },
              ]
            : []),
    ];

    const managementNavItems: NavItem[] = [
        ...(page.props.permissions?.canManageProducts
            ? [
                  {
                      title: 'Productos',
                      href: productsIndex(teamSlug),
                      icon: Boxes,
                  },
                  {
                      title: 'Categorías',
                      href: categoriesIndex(teamSlug),
                      icon: List,
                  },
              ]
            : []),
        ...(page.props.permissions?.canManageInventory
            ? [
                  {
                      title: 'Inventario',
                      href: inventoryIndex(teamSlug),
                      icon: Warehouse,
                  },
              ]
            : []),
        ...(page.props.permissions?.canViewSales
            ? [
                  {
                      title: 'Ventas',
                      href: salesIndex(teamSlug),
                      icon: ReceiptText,
                  },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="group-data-[collapsible=icon]:justify-center"
                        >
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo subtitle="Punto de venta" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* <TeamSwitcher /> */}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain label="Menú" items={mainNavItems} />
                {managementNavItems.length > 0 ? (
                    <NavMain label="Gestión" items={managementNavItems} />
                ) : null}
            </SidebarContent>

            <SidebarFooter>
                <SidebarSeparator className="mb-2" />
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
