"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { nodeDefinitions } from "@/utils/nodes";

export interface ContextMenuProps {
  x: number;
  y: number;
  addNode: (
    nodeDefId: number,
    customPos?: {
      x: number;
      y: number;
    },
  ) => void;
  onClose: () => void;
}

const itemList = nodeDefinitions.map((nd) => {
  return { id: nd.nodeDefId, name: nd.type, category: nd.category };
});

function NodeContextMenu({ x, y, onClose, addNode }: ContextMenuProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState(itemList);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleItemSelect = useCallback(
    (item: (typeof itemList)[0]) => {
      addNode(item.id, { x, y });
      onClose();
    },
    [addNode, onClose, x, y],
  );

  useEffect(() => {
    // Focus the input when menu opens
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Filter items based on search term
    const filtered = itemList.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredItems(filtered);
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleItemSelect(filteredItems[selectedIndex]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, selectedIndex, onClose, handleItemSelect]);

  // Adjust position to keep menu within viewport
  const adjustedX = Math.min(x, window.innerWidth - 300);
  const adjustedY = Math.min(y, window.innerHeight - 400);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      style={{ left: adjustedX, top: adjustedY }}
    >
      <Card className="p-2 shadow-lg border bg-popover">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8"
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            filteredItems.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span>{item.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

export default NodeContextMenu;
