/**
 * Book Viewer Route
 * 
 * Route for displaying PDF books in a flip-book viewer interface.
 * Opens in a separate window for full-screen viewing.
 */

import { createFileRoute } from '@tanstack/react-router';
import { FlipBookViewer } from '@/ui/components/doctor/books/FlipBookViewer';
import { z } from 'zod';

/**
 * Search parameters schema for book viewer route
 */
const bookViewerSearchSchema = z.object({
    url: z.string(),
    title: z.string().optional()
});

export const Route = createFileRoute('/book-viewer')({
    validateSearch: (search) => bookViewerSearchSchema.parse(search),
    component: BookViewerPage,
});

/**
 * Book viewer page component
 * 
 * Renders a full-screen flip-book viewer for PDF documents.
 * 
 * @returns {JSX.Element} Book viewer page component
 */
function BookViewerPage() {
    const { url, title } = Route.useSearch();

    return (
        <div className="h-screen w-screen bg-slate-900">
            <FlipBookViewer
                url={url}
                title={title || 'Livre'}
                onClose={() => window.close()}
            />
        </div>
    );
}
