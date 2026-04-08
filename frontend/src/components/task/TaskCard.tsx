import { clsx } from "clsx";

interface Task {
    id: string;
    title: string;
    priority: "DO_NOW" | "DO_TODAY" | "CAN_WAIT";
    priorityScore: number;
    explanation: string;
    deadline: string | null;
    effort: "QUICK" | "DEEP_WORK";
}

export function TaskCard({ task }: { task: Task }) {
    const priorityStyles = {
        DO_NOW: "priority-badge priority-do-now",
        DO_TODAY: "priority-badge priority-do-today",
        CAN_WAIT: "priority-badge priority-can-wait",
    };

    const priorityLabels = {
        DO_NOW: "Do Now",
        DO_TODAY: "Do Today",
        CAN_WAIT: "Can Wait",
    };

    return (
        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={priorityStyles[task.priority]}>
                            {priorityLabels[task.priority]}
                        </span>
                        {task.effort === "DEEP_WORK" && (
                            <span className="text-xs text-gray-500">ðŸ§  Deep work</span>
                        )}
                    </div>

                    <h3 className="font-medium">{task.title}</h3>

                    <p className="text-sm text-gray-500 mt-1">{task.explanation}</p>
                </div>

                {task.deadline && (
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Deadline</p>
                        <p className="text-sm font-medium">{task.deadline}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
