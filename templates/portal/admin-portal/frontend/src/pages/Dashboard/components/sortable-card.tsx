// export default SortableCard;
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import type { CardId } from "@/types/dashboard";

type SortableCardProps = {
  id: CardId;
  onRemove?: (id: CardId) => void;
  onResize?: () => void;
  children: React.ReactNode;
  className?: string; // <-- new optional className prop
};

const SortableCard: React.FC<SortableCardProps> = ({
  id,
  children,
  onRemove,
  className = "",
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag & Remove Controls */}
      <div className="absolute right-2 z-50 flex items-center space-x-2">
        {/* Drag handle */}
        <button
          type="button"
          aria-label="Drag widget"
          {...listeners}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-grab"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* X Button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            type="button"
            aria-label="Remove widget"
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Card Content wrapper with default padding, override with className */}
      <div className={`rounded-lg bg-white shadow ${className} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
};

export default SortableCard;
