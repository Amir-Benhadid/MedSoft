import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Badge } from "@/ui/components/ui/badge";
import { ScrollArea } from "@/ui/components/ui/scroll-area";
import { Checkbox } from "@/ui/components/ui/checkbox";
import { MessageSquare, Send, CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/components/ui/alert-dialog";
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/ui/lib/utils";
import { useConfig } from "@/ui/contexts/ConfigContext";

const EnhancedMessaging: React.FC = () => {
    const queryClient = useQueryClient();
    const { appMode } = useConfig();
    const [newMessage, setNewMessage] = useState('');
    const [newTodo, setNewTodo] = useState('');
    const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Queries
    const { data: messages = [] } = useQuery({
        queryKey: ['messages', 'today'],
        queryFn: () => orpcClient.messages.list(),
        refetchInterval: 3000,
        enabled: appMode !== 'secretary'
    });

    const { data: todos = [] } = useQuery({
        queryKey: ['todos'],
        queryFn: () => orpcClient.todos.list({ includeCompleted: true }),
        refetchInterval: 3000,
    });

    // Mutations
    const sendMessageMutation = useMutation({
        mutationFn: async (text: string) => {
            return orpcClient.messages.send({ text, sender: 'SECRETARY' });
        },
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });

    const createTodoMutation = useMutation({
        mutationFn: async (text: string) => {
            return orpcClient.todos.create({ text, priority: 'normal' });
        },
        onSuccess: () => {
            setNewTodo('');
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    const toggleTodoMutation = useMutation({
        mutationFn: async (input: { id: string; isCompleted: boolean }) => {
            return orpcClient.todos.toggle(input);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    const deleteTodoMutation = useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.todos.delete({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            sendMessageMutation.mutate(newMessage.trim());
        }
    };

    const handleAddTodo = () => {
        if (newTodo.trim()) {
            createTodoMutation.mutate(newTodo.trim());
        }
    };

    const handleMessageKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleTodoKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddTodo();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages Section - Subtle Rose tint */}
            {appMode !== 'secretary' && (
                <div className="flex-1 min-h-0 flex flex-col px-4 py-4 bg-rose-50/20 border-b border-rose-100/30">
                    <div className="flex items-center gap-2 px-1 mb-3 flex-shrink-0">
                        <div className="p-1.5 rounded-lg bg-rose-100/50">
                            <MessageSquare className="h-3.5 w-3.5 text-rose-600" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Messages</h3>
                        <Badge variant="secondary" className="bg-white/80 text-rose-600 ml-auto border-rose-100 h-5 px-1.5 text-[10px] font-bold">
                            {messages.length}
                        </Badge>
                    </div>

                    <div className="flex-1 min-h-0 rounded-2xl border border-rose-100/50 bg-white/60 shadow-sm overflow-hidden flex flex-col backdrop-blur-sm">
                        <ScrollArea className="flex-1 px-3">
                            <div className="space-y-3 py-4">
                                {messages.length === 0 ? (
                                    <p className="text-[10px] text-rose-300 italic text-center py-12 font-medium tracking-wide font-sans">Aucun message aujourd'hui</p>
                                ) : (
                                    messages.map((message: any) => {
                                        const isSecretary = message.sender.toLowerCase().includes('secretary');
                                        return (
                                            <div key={message.id} className={cn(
                                                "flex flex-col",
                                                isSecretary ? "items-end" : "items-start"
                                            )}>
                                                <div className={cn(
                                                    "max-w-[85%] p-2.5 rounded-2xl text-[11px] font-semibold leading-[1.3] shadow-sm tracking-tight",
                                                    isSecretary
                                                        ? "bg-blue-600 text-white rounded-tr-none"
                                                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                                )}>
                                                    {message.text}
                                                </div>
                                                <span className="text-[8px] text-slate-400 mt-1 px-1 font-bold uppercase tracking-tighter">
                                                    {format(new Date(message.created_at), 'HH:mm')}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-2.5 border-t border-rose-100/20 bg-rose-50/30 flex-shrink-0">
                            <div className="flex gap-2 items-center">
                                <Input
                                    placeholder="Écrire un message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleMessageKeyPress}
                                    className="h-9 text-[11px] bg-white border-rose-100/50 rounded-xl focus-visible:ring-blue-500 flex-1 px-3 shadow-inner placeholder:text-rose-200"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                                    className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md disabled:opacity-30 active:scale-95"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Todos Section - Subtle Purple tint */}
            <div className="flex-1 min-h-0 flex flex-col px-4 py-4 bg-purple-50/30">
                <div className="flex items-center gap-2 px-1 mb-3 flex-shrink-0">
                    <div className="p-1.5 rounded-lg bg-purple-100/50">
                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Tâches</h3>
                    <Badge variant="secondary" className="bg-white/80 text-purple-600 ml-auto border-purple-100 h-5 px-1.5 text-[10px] font-bold">
                        {todos.length}
                    </Badge>
                </div>

                <div className="flex-1 min-h-0 flex flex-col px-1">
                    <div className="flex gap-2 items-center mb-4 flex-shrink-0">
                        <Input
                            placeholder="Ajouter une tâche..."
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={handleTodoKeyPress}
                            className="h-9 text-[11px] bg-white border-purple-100/50 rounded-xl focus-visible:ring-purple-500 flex-1 px-3 shadow-sm placeholder:text-purple-200"
                        />
                        <button
                            onClick={handleAddTodo}
                            disabled={!newTodo.trim() || createTodoMutation.isPending}
                            className="p-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-md disabled:opacity-30 active:scale-95"
                        >
                            <Send className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                        {todos.length === 0 ? (
                            <p className="text-[10px] text-slate-300 italic py-4 font-medium tracking-wide">Aucune tâche en attente</p>
                        ) : (
                            todos
                                .sort((a, b) => {
                                    if (a.is_completed !== b.is_completed) {
                                        return a.is_completed ? 1 : -1;
                                    }
                                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                })
                                .map((todo: any) => (
                                    <div
                                        key={todo.id}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-2xl border border-transparent transition-all cursor-pointer hover:bg-white hover:shadow-sm group shrink-0",
                                            todo.is_completed && "opacity-50"
                                        )}
                                    >
                                        <Checkbox
                                            checked={!!todo.is_completed}
                                            onCheckedChange={() => toggleTodoMutation.mutate({ id: todo.id, isCompleted: !todo.is_completed })}
                                            className="h-4 w-4 rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 shadow-sm flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0" onClick={() => toggleTodoMutation.mutate({ id: todo.id, isCompleted: !todo.is_completed })}>
                                            <div className="flex items-center gap-2">
                                                <p className={cn(
                                                    "text-xs font-semibold leading-none truncate tracking-tight",
                                                    todo.is_completed ? "line-through text-slate-400" : "text-slate-700"
                                                )}>
                                                    {todo.text}
                                                </p>
                                                {todo.priority === 'high' && !todo.is_completed && (
                                                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                )}
                                            </div>
                                        </div>
                                        {appMode === 'secretary' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl shadow-sm border border-red-100 opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTodoToDelete(todo.id);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={!!todoToDelete} onOpenChange={(open) => !open && setTodoToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette tâche ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                                if (todoToDelete) {
                                    deleteTodoMutation.mutate(todoToDelete);
                                    setTodoToDelete(null);
                                }
                            }}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EnhancedMessaging;
