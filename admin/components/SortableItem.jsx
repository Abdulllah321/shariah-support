"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const SortableItem = ({ id ,children}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} className="group">
    {children}
      {/* Drag Handle (Only this is draggable) */}
      <td className="px-4 py-2 text-right">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={20} />
        </span>
      </td>
    </tr>
  );
};

export default SortableItem;
