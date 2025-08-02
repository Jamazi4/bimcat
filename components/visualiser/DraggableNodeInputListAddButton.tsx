import { Plus } from "lucide-react"
import { Button } from "../ui/button"
import { useCallback } from "react";

const DraggableNodeInputListAddButton = (
  { changeThisNodeValues, nodeValues }:
    {
      changeThisNodeValues:
      (inputId: number, value: string | number | boolean) => void;
      nodeValues: Record<string, string | number | boolean> | undefined
    }
) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!nodeValues) return
    const virtualInputIndices =
      Object.entries(nodeValues).map(([index, _]) => {
        const parsedIndex = parseInt(index)
        if (parsedIndex >= 100) {
          return parsedIndex
        }
      }).filter(Boolean)

    const nextIndex = virtualInputIndices[virtualInputIndices.length - 1]

    if (virtualInputIndices.length === 0) {
      changeThisNodeValues(100, true)
    } else {
      if (!nextIndex) return
      changeThisNodeValues(nextIndex + 1, true)
    }
  }, [changeThisNodeValues, nodeValues])

  return (
    <div className="">
      <Button variant='outline'
        size='icon'
        className="bg-accent border w-12 h-12 mx-4 cursor-pointer"
        onClick={(e) => handleClick(e)}
      >
        <Plus className="size-[24px]" />
      </Button>
    </div >
  )
}

export default DraggableNodeInputListAddButton
