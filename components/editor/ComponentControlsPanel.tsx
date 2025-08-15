"use client";

import * as THREE from "three";
import { ComponentControlsType } from "@/utils/schemas";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Lock, Unlock } from "lucide-react";
import { Button } from "../ui/button";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Label } from "../ui/label";
import { useAppSelector } from "@/lib/hooks";
import { smartRound } from "@/utils/nodeDefinitions/nodeUtilFunctions";

const ComponentControlsPanel = ({
  paramMeshGroup,
  uiControls,
  activeControls,
  setActiveControls,
  changeNodeValue,
}: {
  paramMeshGroup: THREE.Group<THREE.Object3DEventMap> | null;
  uiControls: ComponentControlsType;
  activeControls: boolean;
  setActiveControls: Dispatch<SetStateAction<boolean>>;
  changeNodeValue: (
    nodeId: string,
    inputId: number,
    value: string | number | boolean,
    removeValue?: boolean,
  ) => void;
}) => {
  const handleLock = () => {
    let curLock: boolean = true;
    setActiveControls((prev) => {
      curLock = prev;
      return !prev;
    });
    if (curLock) {
      console.log("was locked");
      paramMeshGroup?.clear();
    } else {
      console.log("was unlocked");
    }
  };

  const nodeStateValues = useAppSelector(
    (state) => state.visualiserSlice.nodeValues,
  );

  type ValueStates = Record<string, string | number | boolean>;

  const initializeControlStates = useCallback(() => {
    const initControlStates = uiControls.reduce((acc, cur) => {
      acc[cur.nodeId] = cur.controlValue;
      return acc;
    }, {} as ValueStates);

    return initControlStates;
  }, [uiControls]);

  const initControlStates = initializeControlStates();
  const [controlStates, setControlStates] =
    useState<ValueStates>(initControlStates);

  useEffect(() => {
    const initControlStates = uiControls.reduce((acc, cur) => {
      acc[cur.nodeId] = cur.controlValue;
      return acc;
    }, {} as ValueStates);

    setControlStates(initControlStates);
  }, [uiControls, activeControls]);

  const handleSliderChange = (e: number[], nodeId: string) => {
    changeNodeValue(nodeId, 3, e[0]);
    setControlStates((prev) => {
      return { ...prev, [nodeId]: e[0] };
    });
  };

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    nodeId: string,
  ) => {
    const val = e.target.value;
    setControlStates((prev) => ({
      ...prev,
      [nodeId]: val, // keep it as string
    }));

    const num = Number(val);
    const valid = !isNaN(num) && val.trim() !== "";
    if (valid) {
      changeNodeValue(nodeId, 0, num);
    }
  };

  const handleBooleanChange = (checked: boolean, nodeId: string) => {
    setControlStates((prev) => ({
      ...prev,
      [nodeId]: checked,
    }));

    changeNodeValue(nodeId, 0, checked); // assuming `2` is your boolean inputId
  };

  const labelClassname = `${!activeControls && "text-muted-foreground"} transition-colors`;
  const controlClassName = `transition-colors`;
  return (
    <div className="py-0.5 my-4">
      <div className="flex place-content-between items-center">
        <h1 className="font-bold my-2">Parametric Controls</h1>
        <Button variant="ghost" size="icon" onClick={handleLock}>
          {!activeControls ? <Lock /> : <Unlock />}
        </Button>
      </div>
      <div className={`grid grid-cols-2 gap-4`}>
        {uiControls.map((c) => {
          return (
            <div key={c.nodeId} className=" p-2 border-b bg-accent rounded-md">
              <div className="place-content-between flex text-sm">
                <Label className={labelClassname} htmlFor={c.nodeId}>
                  {c.controlName}
                </Label>
                <h2 className={labelClassname}>
                  {activeControls
                    ? smartRound(
                        Number(
                          nodeStateValues?.[c.nodeId]?.[
                            c.controlType === "slider" ? 4 : 1
                          ],
                        ),
                      )
                    : smartRound(Number(c.outputValue))}
                </h2>
              </div>
              <div className="h-12 items-center flex">
                {c.controlType === "slider" && (
                  <Slider
                    onValueChange={(e) => handleSliderChange(e, c.nodeId)}
                    className={controlClassName}
                    id={c.nodeId}
                    disabled={!activeControls}
                    value={[+controlStates[c.nodeId]]}
                  />
                )}

                {c.controlType === "checkbox" && (
                  <Checkbox
                    onCheckedChange={(val) =>
                      handleBooleanChange(val === true, c.nodeId)
                    }
                    className={controlClassName}
                    id={c.nodeId}
                    disabled={!activeControls}
                    checked={Boolean(controlStates[c.nodeId])}
                  />
                )}

                {c.controlType === "numberInput" && (
                  <Input
                    onChange={(e) => handleNumberChange(e, c.nodeId)}
                    className={controlClassName}
                    id={c.nodeId}
                    disabled={!activeControls}
                    value={controlStates[c.nodeId] as string}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComponentControlsPanel;
