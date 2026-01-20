import { useState, useRef, useEffect } from 'react';
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { MessageCircle, CheckSquare, Send, X, Plus, Trash2, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from "@/ui/lib/orpc/client";
import { cn } from "@/ui/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";
import { Checkbox } from "@/ui/components/ui/checkbox";
import { ScrollArea } from "@/ui/components/ui/scroll-area";

export function FloatingMessaging() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('messages');

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-[350px] h-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex items-center justify-between w-full">
                                <TabsList className="h-8">
                                    <TabsTrigger value="messages" className="text-xs h-7 px-3">Messages</TabsTrigger>
                                    <TabsTrigger value="todos" className="text-xs h-7 px-3">Tâches</TabsTrigger>
                                </TabsList>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </Tabs>
                    </div>

                    <div className="flex-1 overflow-hidden bg-white">
                        {activeTab === 'messages' ? <MessagesTab /> : <TodosTab />}
                    </div>
                </div>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={cn(
                    "rounded-full h-14 w-14 shadow-lg transition-all duration-300 text-white",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                {!isOpen && <UnreadBadge />}
            </Button>
        </div>
    );
}

function UnreadBadge() {
    const { data } = useQuery({
        queryKey: ['messages', 'unread', 'secretary'],
        queryFn: () => orpcClient.messages.countUnread({ sender: 'SECRETARY' }),
        refetchInterval: 5000
    });

    if (!data?.count) return null;

    return (
        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold">
            {data.count}
        </span>
    );
}

function MessagesTab() {
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: messages = [] } = useQuery({
        queryKey: ['messages', 'today'],
        queryFn: () => orpcClient.messages.list(),
        refetchInterval: 3000
    });

    const sendMutation = useMutation({
        mutationFn: (text: string) => orpcClient.messages.send({ text, sender: 'DOCTOR' }),
        onSuccess: () => {
            setText('');
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            setTimeout(scrollToBottom, 100);
        }
    });

    const scrollToBottom = () => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim()) return;
        sendMutation.mutate(text);
    };

    // Group messages? Simple list for now.
    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 text-sm mt-10">
                            Aucun message aujourd'hui
                        </div>
                    )}
                    {messages.map((msg: any) => {
                        const isMe = msg.sender === 'DOCTOR';
                        return (
                            <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "items-start")}>
                                <div className={cn(
                                    "px-3 py-2 rounded-lg text-sm",
                                    isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"
                                )}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                    <Input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Écrire un message..."
                        className="h-9 text-sm"
                        autoFocus
                    />
                    <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!text.trim() || sendMutation.isPending}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}

function TodosTab() {
    const [text, setText] = useState('');
    const queryClient = useQueryClient();

    const { data: todos = [] } = useQuery({
        queryKey: ['todos'],
        queryFn: () => orpcClient.todos.list({ includeCompleted: false }),
    });

    const createMutation = useMutation({
        mutationFn: (text: string) => orpcClient.todos.create({ text }),
        onSuccess: () => {
            setText('');
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) => orpcClient.todos.toggle({ id, isCompleted }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => orpcClient.todos.delete({ id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        createMutation.mutate(text);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-100">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Nouvelle tâche..."
                        className="h-9 text-sm"
                    />
                    <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!text.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>
            </div>
            <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                    {todos.length === 0 && (
                        <div className="text-center text-slate-400 text-sm mt-10 flex flex-col items-center gap-2">
                            <CheckSquare className="h-8 w-8 opacity-20" />
                            <p>Rien à faire, profitez-en !</p>
                        </div>
                    )}
                    {todos.map((todo: any) => (
                        <div key={todo.id} className="group flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <Checkbox
                                checked={todo.is_completed}
                                onCheckedChange={(checked) => toggleMutation.mutate({ id: todo.id, isCompleted: !!checked })}
                            />
                            <span className={cn("flex-1 text-sm text-slate-700", todo.is_completed && "line-through text-slate-400")}>
                                {todo.text}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                onClick={() => deleteMutation.mutate(todo.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
