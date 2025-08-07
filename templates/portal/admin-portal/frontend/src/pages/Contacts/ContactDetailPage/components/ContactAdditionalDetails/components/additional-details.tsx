import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ContactAdditionalInfoSkeleton from "./addition-details-skeleton";

interface ContactData {
  [key: string]: any;
}

interface AdditionalInfoProps {
  contactData: ContactData;
  loading?: boolean;

}

function formatLabel(key: string) {
  return key
    .replace(/:label$/, "")
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function groupFieldsByCategory(data: ContactData) {
  const grouped: Record<string, Record<string, any>> = {
    "Basic Info": {},
    Address: {},
    "Contact Info": {},
    Other: {},
  };

  if (!data || typeof data !== "object") {
    return grouped;
  }

  const seenKeys = new Set();

  for (const key in data) {
    if (key.endsWith(":label") || key.endsWith(":name")) {
      const baseKey = key.replace(/:(label|name)$/, "");
      seenKeys.add(baseKey);
    }
  }

  for (const key in data) {
    if (seenKeys.has(key)) continue;

    const labelKey = `${key}:label`;
    const nameKey = `${key}:name`;

    const displayValue =
      labelKey in data
        ? data[labelKey]
        : nameKey in data
        ? data[nameKey]
        : data[key];

    if (key.startsWith("email_primary") || key.startsWith("phone_primary")) {
      grouped["Contact Info"][key] = displayValue;
    } else if (key.startsWith("address_primary")) {
      grouped["Address"][key] = displayValue;
    } else if (key.includes(".")) {
      const customGroup = key.split(".")[0];
      const groupLabel = formatLabel(customGroup);
      if (!grouped[groupLabel]) grouped[groupLabel] = {};
      grouped[groupLabel][key] = displayValue;
    } else {
      grouped["Basic Info"][key] = displayValue;
    }
  }

  return grouped;
}

function SortableWidget({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function ContactAdditionalInfo({ contactData, loading = false }: AdditionalInfoProps) {
  // Show skeleton if contactData is missing or empty
  // if (!contactData || Object.keys(contactData).length === 0) {
  //   return <ContactAdditionalInfoSkeleton />;
  // }
 //if (loading) return <ContactAdditionalInfoSkeleton />;
 if (loading || !contactData || Object.keys(contactData).length === 0) {
  return <ContactAdditionalInfoSkeleton />;
}
  if (!contactData || Object.keys(contactData).length === 0) return <p>No additional info available.</p>;

  const grouped = groupFieldsByCategory(contactData);
  const allWidgets = Object.keys(grouped);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(allWidgets);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setVisibleWidgets((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function removeWidget(section: string) {
    setVisibleWidgets((prev) => prev.filter((item) => item !== section));
  }

  function toggleWidget(section: string) {
    setVisibleWidgets((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  }

  return (
    <div className="space-y-4">
      {/* Manage Widgets Dropdown */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Plus className="w-4 h-4" />
              Manage Widgets
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Show/Hide Widgets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allWidgets.map((widget) => (
              <DropdownMenuCheckboxItem
                key={widget}
                checked={visibleWidgets.includes(widget)}
                onCheckedChange={() => toggleWidget(widget)}
              >
                {widget}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Widgets Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext items={visibleWidgets} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleWidgets.map((sectionName) => (
              <SortableWidget key={sectionName} id={sectionName}>
                <Card className="p-5 shadow-sm border border-gray-200 h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold">{sectionName}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => removeWidget(sectionName)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {Object.entries(grouped[sectionName] || {}).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-gray-600 mb-1">
                          {formatLabel(key)}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {value === null || value === "" ? (
                            <span className="italic text-gray-400">N/A</span>
                          ) : (
                            value.toString()
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
