import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import {
    Book as BookIcon, Loader2, BookOpen, Clock, HardDrive,
    Folder as FolderIcon, Home, ChevronRight, Search, Plus, FolderPlus
} from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure worker (ensure it's set)
// Configure worker (ensure it's set)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function BookCover({ url }: { url: string }) {
    return (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
            <Document file={url} loading={<div className="w-full h-full bg-slate-100 animate-pulse" />}>
                <Page
                    pageNumber={1}
                    width={200} // Render at specific width for thumbnail
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-md"
                />
            </Document>
        </div>
    );
}

export function BooksLibrary() {
    const queryClient = useQueryClient();
    const [currentPath, setCurrentPath] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['books', currentPath],
        queryFn: async () => orpcClient.books.list({ path: currentPath })
    });

    const createFolderMutation = useMutation({
        mutationFn: async (name: string) => orpcClient.books.createFolder({ path: currentPath, name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books', currentPath] });
            setIsCreatingFolder(false);
            setNewFolderName('');
        }
    });

    const openFolderMutation = useMutation({
        mutationFn: async () => orpcClient.books.openFolder()
    });

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
        setSearchQuery('');
    };

    const handleBreadcrumbClick = (index: number) => {
        const parts = currentPath.split('/').filter(Boolean);
        const newPath = parts.slice(0, index + 1).join('/');
        setCurrentPath(newPath);
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '-';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const breadcrumbs = currentPath.split('/').filter(Boolean);

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-md">
                            <BookIcon className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">Bibliothèque</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9 w-64 h-9 bg-slate-50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openFolderMutation.mutate()}>
                            <HardDrive className="w-4 h-4 mr-2" />
                            Explorer
                        </Button>
                    </div>
                </div>

                {/* Navigation Toolbar */}
                <div className="flex items-center justify-between">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-slate-600 overflow-hidden">
                        <button
                            onClick={() => setCurrentPath('')}
                            className={`p-1 rounded hover:bg-slate-100 flex items-center ${currentPath === '' ? 'font-bold text-slate-900' : ''}`}
                        >
                            <Home className="w-4 h-4" />
                        </button>
                        {breadcrumbs.map((part, index) => (
                            <div key={index} className="flex items-center">
                                <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
                                <button
                                    onClick={() => handleBreadcrumbClick(index)}
                                    className={`hover:underline truncate max-w-[150px] ${index === breadcrumbs.length - 1 ? 'font-bold text-slate-900' : ''}`}
                                >
                                    {part}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {isCreatingFolder ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                <Input
                                    autoFocus
                                    placeholder="Nom du dossier..."
                                    className="h-8 w-40"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') createFolderMutation.mutate(newFolderName);
                                        if (e.key === 'Escape') setIsCreatingFolder(false);
                                    }}
                                />
                                <Button size="sm" onClick={() => createFolderMutation.mutate(newFolderName)} disabled={!newFolderName}>OK</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsCreatingFolder(false)}>Annuler</Button>
                            </div>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={() => setIsCreatingFolder(true)}>
                                <FolderPlus className="w-4 h-4 mr-2 text-blue-600" />
                                Nouveau dossier
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                            {searchQuery ? <Search className="w-8 h-8 text-slate-400" /> : <FolderIcon className="w-8 h-8 text-slate-400" />}
                        </div>
                        <p className="text-slate-500">
                            {searchQuery ? "Aucun résultat trouvé." : "Ce dossier est vide."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Folders */}
                        {filteredItems.some(i => i.type === 'folder') && (
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Dossiers</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {filteredItems.filter(i => i.type === 'folder').map((folder) => (
                                        <div
                                            key={folder.name}
                                            onClick={() => handleNavigate(folder.relativePath)}
                                            className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex items-center gap-3"
                                        >
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <FolderIcon className="w-6 h-6" />
                                            </div>
                                            <span className="font-medium text-slate-700 group-hover:text-blue-700 truncate">{folder.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files */}
                        {filteredItems.some(i => i.type === 'file') && (
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Livres</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                    {filteredItems.filter(i => i.type === 'file').map((book) => (
                                        <div
                                            key={book.name}
                                            className="group bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer w-full max-w-[200px]"
                                            onClick={() => {
                                                const params = new URLSearchParams({
                                                    url: book.url!,
                                                    title: book.name.replace('.pdf', '')
                                                });
                                                const width = 1200;
                                                const height = 900;
                                                const left = (window.screen.width - width) / 2;
                                                const top = (window.screen.height - height) / 2;

                                                const isElectron = window.location.protocol === 'file:';
                                                const basePath = isElectron ? '#/book-viewer' : '/book-viewer';

                                                window.open(
                                                    `${basePath}?${params.toString()}&window=main`,
                                                    '_blank',
                                                    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
                                                );
                                            }}
                                        >
                                            {/* Cover */}
                                            <div className="aspect-[1/1.4] bg-slate-100 relative group-hover:brightness-105 transition-all overflow-hidden">
                                                <BookCover url={book.url!} />

                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <Button size="sm" className="shadow-xl">
                                                        <BookOpen className="w-4 h-4 mr-2" />
                                                        Lire
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="p-3">
                                                <h3 className="font-medium text-sm text-slate-900 line-clamp-2 leading-tight mb-2" title={book.name}>
                                                    {book.name.replace('.pdf', '')}
                                                </h3>
                                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                    <span>{formatSize(book.size)}</span>
                                                    <span>{format(new Date(book.createdAt), 'dd/MM/yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
