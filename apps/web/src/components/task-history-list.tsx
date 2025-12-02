import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskHistoryListProps {
    taskId: string;
}

interface HistoryItem {
    id: string;
    action: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    createdAt: string;
    userId: string;
}

async function fetchHistory(taskId: string) {
    const response = await api.get(`/tasks/${taskId}/history`);
    return response.data;
}

export function TaskHistoryList({ taskId }: TaskHistoryListProps) {
    const { data: history, isLoading } = useQuery({
        queryKey: ["task-history", taskId],
        queryFn: () => fetchHistory(taskId),
    });

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Carregando histórico...</div>;
    }

    if (!history || history.length === 0) {
        return <div className="text-sm text-muted-foreground">Nenhum histórico encontrado.</div>;
    }

    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
                {history.map((item: HistoryItem) => (
                    <div key={item.id} className="flex flex-col space-y-1 text-sm border-b pb-2 last:border-0">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.createdAt), {
                                    addSuffix: true,
                                    locale: ptBR,
                                })}
                            </span>
                        </div>
                        <p className="text-foreground">
                            {formatMessage(item)}
                        </p>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

function formatMessage(item: HistoryItem) {
    switch (item.action) {
        case "CREATED":
            return "Tarefa criada.";
        case "UPDATED":
            if (item.field === "STATUS") {
                return `Status alterado de "${item.oldValue}" para "${item.newValue}".`;
            }
            if (item.field === "PRIORITY") {
                return `Prioridade alterada de "${item.oldValue}" para "${item.newValue}".`;
            }
            if (item.field === "ASSIGNEES") {
                return "Atribuições atualizadas.";
            }
            return "Tarefa atualizada.";
        default:
            return "Ação desconhecida.";
    }
}
