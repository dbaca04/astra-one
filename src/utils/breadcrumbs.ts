import type { BreadcrumbItem as AdminBreadcrumbItem } from '../components/admin/Breadcrumbs.astro';

export interface TitleMappings {
    [key: string]: string;
}

export type DynamicTitleFn = (segment: string, currentPath: string, fullPathname: string) => Promise<string | null | undefined> | string | null | undefined;
export type IsValidSegmentFn = (item: AdminBreadcrumbItem) => Promise<boolean> | boolean;

/**
 * Generates breadcrumbs for admin pages.
 * Consumers can filter out breadcrumbs (e.g., 'Edit') for non-existent pages before rendering
 * by providing an `isValidSegment` callback.
 */
export async function generateBreadcrumbs(
    pathname: string,
    titleMappings: TitleMappings = {},
    basePath: string = '/admin',
    getDynamicTitle?: DynamicTitleFn,
    isValidSegment?: IsValidSegmentFn
): Promise<AdminBreadcrumbItem[]> {
    const generatedBreadcrumbs: AdminBreadcrumbItem[] = [];
    const pathSegments = pathname.startsWith(basePath)
        ? pathname.substring(basePath.length).split('/').filter(segment => segment !== '')
        : [];

    // Add base breadcrumb (e.g., "Admin")
    const baseItem: AdminBreadcrumbItem = {
        text: titleMappings[basePath] || 'Admin',
        url: basePath,
    };
    if (!isValidSegment || (await isValidSegment(baseItem))) {
        generatedBreadcrumbs.push(baseItem);
    }

    let currentPath = basePath;
    for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        currentPath += (currentPath.endsWith('/') ? '' : '/') + segment;

        let label = titleMappings[currentPath] || titleMappings[segment];

        if (!label && getDynamicTitle) {
            const dynamicLabel = await getDynamicTitle(segment, currentPath, pathname);
            if (dynamicLabel) {
                label = dynamicLabel;
            }
        }

        if (!label) {
            label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        }

        const potentialItem: AdminBreadcrumbItem = {
            text: label,
            url: currentPath,
        };

        if (!isValidSegment || (await isValidSegment(potentialItem))) {
            generatedBreadcrumbs.push(potentialItem);
        }
    }

    // Filtered breadcrumbs (those that passed validation)
    const finalBreadcrumbs: AdminBreadcrumbItem[] = [...generatedBreadcrumbs];

    // Mark the last breadcrumb as current if there are multiple breadcrumbs
    if (finalBreadcrumbs.length > 0) {
        finalBreadcrumbs[finalBreadcrumbs.length - 1].isCurrentPage = true;
        if (finalBreadcrumbs.length > 1) {
            delete finalBreadcrumbs[finalBreadcrumbs.length - 1].url; // Current page should not have a URL
        }
    }

    return finalBreadcrumbs;
} 