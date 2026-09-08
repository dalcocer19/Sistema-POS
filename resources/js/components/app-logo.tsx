import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

type Props = {
    subtitle?: string;
};

export default function AppLogo({ subtitle }: Props) {
    const { name, currentTeam } = usePage().props;

    const displayName = 'Avenida Express';
    const logoUrl = currentTeam?.logoUrl ?? null;

    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={displayName}
                        className="size-full object-contain p-0.5"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid min-w-0 flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold">
                    {displayName}
                </span>
                {subtitle ? (
                    <span className="text-muted-foreground truncate text-xs">
                        {subtitle}
                    </span>
                ) : null}
            </div>
        </>
    );
}
