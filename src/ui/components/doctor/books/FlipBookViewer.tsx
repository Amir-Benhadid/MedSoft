import { useRef, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { cn } from '@/ui/lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FlipBookViewerProps {
    url: string;
    onClose: () => void;
    title: string;
}

export function FlipBookViewer({ url, onClose, title }: FlipBookViewerProps) {
    const bookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [pageDimensions, setPageDimensions] = useState({ width: 600, height: 800 });
    const [ready, setReady] = useState(false);

    // Navigation State
    const [targetPage, setTargetPage] = useState("");

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setReady(true);
    }

    const handleJumpToPage = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(targetPage);
        if (page > 0 && page <= numPages && bookRef.current) {
            bookRef.current.pageFlip().turnToPage(page - 1); // 0-indexed
            setTargetPage("");
        }
    };

    // Auto-fit to window logic & Maximize
    useEffect(() => {
        // Request Maximize
        if ((window as any).electronAPI?.maximizeWindow) {
            (window as any).electronAPI.maximizeWindow();
        }

        if (!containerRef.current) return;

        const handleResize = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;

            const padding = 60;
            const toolbarHeight = 80;

            const availW = clientWidth - padding;
            const availH = clientHeight - toolbarHeight;

            let newHeight = availH * 0.95;
            let newWidth = newHeight * 0.707;

            if (newWidth * 2 > availW) {
                newWidth = (availW * 0.95) / 2;
                newHeight = newWidth / 0.707;
            }

            setPageDimensions({ width: newWidth, height: newHeight });
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);
        handleResize();

        return () => observer.disconnect();
    }, []);

    const next = () => bookRef.current?.pageFlip()?.flipNext();
    const prev = () => bookRef.current?.pageFlip()?.flipPrev();

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 px-8 text-white bg-slate-900 border-b border-white/10 shrink-0 h-16 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <h2 className="text-lg font-bold truncate max-w-[200px]">{title}</h2>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-2 bg-slate-800 rounded-md p-1 border border-slate-700">
                        <span className="text-sm text-slate-400 pl-2">Page</span>
                        <form onSubmit={handleJumpToPage}>
                            <Input
                                className="h-6 w-12 bg-slate-900 border-slate-700 text-center text-xs p-0 focus-visible:ring-1 focus-visible:ring-blue-500"
                                value={targetPage}
                                onChange={(e) => setTargetPage(e.target.value)}
                                placeholder={(currentPage + 1).toString()}
                            />
                        </form>
                        <span className="text-sm text-slate-400 pr-2">/ {numPages}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="text-slate-300 hover:text-white">
                        <ZoomOut className="w-5 h-5" />
                    </Button>
                    <span className="text-xs font-mono w-12 text-center text-slate-400">{Math.round(scale * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="text-slate-300 hover:text-white">
                        <ZoomIn className="w-5 h-5" />
                    </Button>
                    <div className="h-4 w-[1px] bg-slate-700 mx-2" />
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full">
                        <X className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Main Area */}
            <div ref={containerRef} className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-900 w-full h-full">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex items-center justify-center"
                    loading={
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    }
                >
                    {ready && numPages > 0 && (
                        <>
                            <Button
                                variant="ghost"
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-16 w-16 rounded-full"
                                onClick={prev}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </Button>

                            <div className="relative shadow-2xl shadow-black/50 transition-all duration-300">
                                {/* @ts-ignore */}
                                <HTMLFlipBook
                                    width={pageDimensions.width * scale}
                                    height={pageDimensions.height * scale}
                                    size="fixed"
                                    minWidth={300}
                                    maxWidth={2000}
                                    minHeight={400}
                                    maxHeight={2000}
                                    maxShadowOpacity={0.5}
                                    showCover={true}
                                    mobileScrollSupport={true}
                                    onFlip={(e) => setCurrentPage(e.data)}
                                    ref={bookRef}
                                    className={cn("shadow-2xl")}
                                    style={{}}
                                    startPage={0}
                                    drawShadow={true}
                                    flippingTime={1000}
                                    usePortrait={false}
                                    startZIndex={0}
                                    autoSize={true}
                                    clickEventForward={true}
                                    useMouseEvents={true}
                                    swipeDistance={30}
                                    showPageCorners={true}
                                    disableFlipByClick={false}
                                >
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <div key={index} className="bg-white overflow-hidden shadow-inner border-r border-slate-100">
                                            <div className="h-full w-full relative flex flex-col">
                                                {Math.abs(currentPage - index) < 5 ? (
                                                    <Page
                                                        pageNumber={index + 1}
                                                        width={pageDimensions.width * scale}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                        loading={
                                                            <div className="flex items-center justify-center h-full w-full bg-slate-50">
                                                                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                                                            </div>
                                                        }
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full bg-slate-50">
                                                        {/* Placeholder */}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-400 font-mono">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </HTMLFlipBook>
                            </div>

                            <Button
                                variant="ghost"
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-16 w-16 rounded-full"
                                onClick={next}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </Button>
                        </>
                    )}
                </Document>
            </div>
        </div>
    );
}
