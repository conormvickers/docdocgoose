import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem";

interface Props {
  data: {
    items: { id: string; label: string }[];
  };
  itemsChangedCallback: (items: object[]) => void;
}
export default function Sortable(props: Props) {
  const [items, setItems] = useState(props.data.items);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} itemobject={item} />
            
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(items.find((i) => i.id === active.id)!);
        const newIndex = items.indexOf(items.find((i) => i.id === over.id)!);

        const amove = arrayMove(items, oldIndex, newIndex);
        props.itemsChangedCallback(amove);
        return amove;
      });
    }
  }
}
