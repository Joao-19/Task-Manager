import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TaskPriority } from '@repo/dtos';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const createTaskSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    priority: z.nativeEnum(TaskPriority),
    dueDate: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

export function CreateTaskDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data;
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateTaskForm>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            priority: TaskPriority.LOW,
            assigneeIds: [],
        },
    });

    const priority = watch('priority');
    const assigneeIds = watch('assigneeIds') || [];

    const toggleUser = (userId: string) => {
        const current = assigneeIds;
        if (current.includes(userId)) {
            setValue(
                'assigneeIds',
                current.filter((id) => id !== userId),
            );
        } else {
            setValue('assigneeIds', [...current, userId]);
        }
    };

    const onSubmit = async (data: CreateTaskForm) => {
        try {
            await api.post('/tasks', data);

            toast({
                title: 'Tarefa criada!',
                description: 'Sua tarefa foi adicionada com sucesso.',
                className: 'bg-green-50 border-green-200',
            });

            // Invalida o cache para recarregar a lista
            queryClient.invalidateQueries({ queryKey: ['tasks'] });

            setOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro ao criar tarefa',
                description: 'Tente novamente mais tarde.',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Tarefa</DialogTitle>
                    <DialogDescription>
                        Crie uma nova tarefa para acompanhar seu progresso.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            placeholder="Ex: Implementar Login"
                            {...register('title')}
                        />
                        {errors.title && (
                            <span className="text-xs text-red-500">{errors.title.message}</span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            placeholder="Detalhes da tarefa..."
                            {...register('description')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Prioridade</Label>
                            <Select
                                value={priority}
                                onValueChange={(val) => setValue('priority', val as TaskPriority)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TaskPriority.LOW}>Baixa</SelectItem>
                                    <SelectItem value={TaskPriority.MEDIUM}>Média</SelectItem>
                                    <SelectItem value={TaskPriority.HIGH}>Alta</SelectItem>
                                    <SelectItem value={TaskPriority.URGENT}>Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Prazo</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                {...register('dueDate')}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Atribuir a:</Label>
                        <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2">
                            {users?.map((user: any) => (
                                <div key={user.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`user-${user.id}`}
                                        checked={assigneeIds.includes(user.id)}
                                        onChange={() => toggleUser(user.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor={`user-${user.id}`} className="text-sm font-normal cursor-pointer">
                                        {user.username} ({user.email})
                                    </Label>
                                </div>
                            ))}
                            {(!users || users.length === 0) && (
                                <p className="text-xs text-muted-foreground">Nenhum usuário encontrado.</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Criando...' : 'Criar Tarefa'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
