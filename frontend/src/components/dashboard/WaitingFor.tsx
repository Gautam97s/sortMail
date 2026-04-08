const waitingItems: Array<{ id: string; recipient: string; subject: string; daysWaiting: number }> = [];

export function WaitingFor() {
    return (
        <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Waiting For Reply</h2>
            </div>

            <div className="p-4 space-y-4">
                {waitingItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start justify-between gap-4"
                    >
                        <div>
                            <p className="font-medium text-sm">{item.subject}</p>
                            <p className="text-xs text-gray-500">{item.recipient}</p>
                        </div>
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            {item.daysWaiting}d
                        </span>
                    </div>
                ))}

                {waitingItems.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">
                        No pending replies
                    </p>
                )}
            </div>
        </div>
    );
}
