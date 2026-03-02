import { useState, useRef, useEffect } from 'react';
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { MessageCircle, CheckSquare, Send, X, Plus, Trash2, Calendar, Flag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from "@/ui/lib/orpc/client";
import { cn } from "@/ui/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";
import { Checkbox } from "@/ui/components/ui/checkbox";
import { ScrollArea } from "@/ui/components/ui/scroll-area";
import { Badge } from "@/ui/components/ui/badge";

export function FloatingMessaging() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('messages');

    const { data: allMessages = [] } = useQuery({
        queryKey: ['messages', 'today'],
        queryFn: () => orpcClient.messages.list(),
        refetchInterval: 3000
    });

    const { data: todos = [] } = useQuery({
        queryKey: ['todos'],
        queryFn: () => orpcClient.todos.list({ includeCompleted: true }),
        refetchInterval: 5000,
        placeholderData: (previousData) => previousData
    });

    // Filter messages (exclude legacy file messages if any still exist, or just show all non-file styled messages)
    const chatMessages = allMessages.filter((msg: any) => msg.sender === 'SECRETARY' || msg.sender === 'DOCTOR');

    // Calculate unread counts
    const unreadChatCount = chatMessages.filter((msg: any) => msg.sender === 'SECRETARY' && !msg.is_read).length;

    const totalCount = unreadChatCount;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-[350px] h-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex items-center justify-between w-full">
                                <TabsList className="h-8 w-full justify-start">
                                    <TabsTrigger value="messages" className="text-xs h-7 px-3 flex gap-1">
                                        Messages
                                        {unreadChatCount > 0 && <span className="bg-red-500 text-white text-[10px] items-center justify-center flex h-4 w-4 rounded-full ml-1">{unreadChatCount}</span>}
                                    </TabsTrigger>

                                    <TabsTrigger value="todos" className="text-xs h-7 px-3">Tâches</TabsTrigger>
                                </TabsList>
                                <Button variant="ghost" size="icon" className="h-7 w-7 min-w-7 text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </Tabs>
                    </div>

                    <div className="flex-1 overflow-hidden bg-white">
                        {activeTab === 'messages' && <MessagesTab messages={chatMessages} />}

                        {activeTab === 'todos' && <TodosTab />}
                    </div>
                </div>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={cn(
                    "rounded-full h-14 w-14 shadow-lg transition-all duration-300 z-50",
                    isOpen && "rotate-90",
                    !isOpen && totalCount > 0
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
            >
                {!isOpen && totalCount > 0 ? (
                    <span className="text-xl font-bold font-sans">{totalCount}</span>
                ) : (
                    isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />
                )}
            </Button>
        </div>
    );
}

function MessagesTab({ messages }: { messages: any[] }) {
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const markAsReadMutation = useMutation({
        mutationFn: (ids: string[]) => orpcClient.messages.markAsRead({ ids }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] })
    });

    useEffect(() => {
        const unreadIds = messages
            .filter((msg: any) => msg.sender === 'SECRETARY' && !msg.is_read)
            .map((msg: any) => msg.id);

        if (unreadIds.length > 0) {
            markAsReadMutation.mutate(unreadIds);
        }
    }, [messages.length, messages]);

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
                        // Hide legacy file messages from chat view if regex matches
                        if (/@\[([^\]]+)\]/g.test(msg.text)) return null;

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
                                    {isMe && (
                                        <span className="ml-1">
                                            {msg.is_read ? "• Lu" : "• Envoyé"}
                                        </span>
                                    )}
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
    const [priority, setPriority] = useState<'normal' | 'high'>('normal');
    const queryClient = useQueryClient();

    const { data: todos = [] } = useQuery({
        queryKey: ['todos'],
        queryFn: () => orpcClient.todos.list({ includeCompleted: true }),
    });

    const createMutation = useMutation({
        mutationFn: (data: { text: string; priority: 'normal' | 'high' }) => orpcClient.todos.create(data),
        onSuccess: () => {
            setText('');
            setPriority('normal');
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
        createMutation.mutate({ text, priority });
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
                    <Button
                        type="button" // Prevent form submission
                        variant="ghost"
                        size="icon"
                        onClick={() => setPriority(p => p === 'normal' ? 'high' : 'normal')}
                        className={cn(
                            "h-9 w-9 shrink-0 transition-colors",
                            priority === 'high' ? "text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700" : "text-slate-400 hover:text-slate-600"
                        )}
                        title={priority === 'high' ? "Priorité haute" : "Priorité normale"}
                    >
                        <Flag className={cn("h-4 w-4", priority === 'high' && "fill-current")} />
                    </Button>
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
                        <div key={todo.id} className={cn(
                            "group flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors border-l-2",
                            todo.priority === 'high' ? "border-red-500 bg-red-50/30" : "border-transparent"
                        )}>
                            <Checkbox
                                checked={todo.is_completed}
                                onCheckedChange={(checked) => toggleMutation.mutate({ id: todo.id, isCompleted: !!checked })}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-sm truncate",
                                        todo.is_completed ? "line-through text-slate-400" : "text-slate-700",
                                        todo.priority === 'high' && !todo.is_completed && "font-medium text-slate-900"
                                    )}>
                                        {todo.text}
                                    </span>
                                    {todo.priority === 'high' && !todo.is_completed && (
                                        <Flag className="h-3 w-3 text-red-500 fill-red-500" />
                                    )}
                                </div>
                            </div>
                            {todo.is_completed && todo.completed_at && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(todo.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
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
