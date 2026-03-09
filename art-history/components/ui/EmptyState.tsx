interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'No items found.' }: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
