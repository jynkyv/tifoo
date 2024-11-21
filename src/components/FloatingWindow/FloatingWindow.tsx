import React, { useEffect, useRef, useState } from "react";
import type { FloatingWindowProps, ClassItem, ToastProps } from "@/types";
import {
  useFloatingWindowLogic,
  useClassManagement,
  useDraggable,
} from "@/hooks";
import {
  FloatingWindowHeader,
  ClassList,
  AutoComplete,
  Toast,
  ElementNavigation,
} from "@/components";
import { api } from "@/services/api";

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  element,
  position,
  isFixed,
  onDeactivate,
  onClassChange,
  onElementSelect,
  setPosition,
}) => {
  const floatingWindowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    classes,
    query,
    autocompleteResults,
    handleAddClass,
    handleRemoveClass,
    handleClassToggle,
    handleInputChange,
  } = useClassManagement(element, onClassChange);

  const {
    toast: floatingWindowToast,
    setToast: setFloatingWindowToast,
    handleCopyClasses,
    handleCopyElement,
  } = useFloatingWindowLogic(classes, element);

  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } =
    useDraggable(isFixed, headerRef, floatingWindowRef, position, setPosition);

  useEffect(() => {
    if (isFixed) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isFixed, handleMouseMove, handleMouseUp]);

  const handleDivMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseDown(e.nativeEvent);
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const generator = api.streamGenerate({
        elementCode: element.outerHTML,
        description: prompt.trim(),
      });

      let fullContent = "";
      let lastProcessedClasses = new Set<string>();

      for await (const chunk of generator) {
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6);
              const data = JSON.parse(jsonStr);
              if (data.content) {
                fullContent += data.content;

                const classMatch = fullContent.match(/class="([^"]*)"/);
                if (classMatch && classMatch[1]) {
                  const currentClasses = new Set(
                    classMatch[1].split(/\s+/).filter(Boolean)
                  );

                  lastProcessedClasses.forEach((cls) => {
                    if (!currentClasses.has(cls)) {
                      element.classList.remove(cls);
                    }
                  });
                  currentClasses.forEach((cls) => {
                    if (!lastProcessedClasses.has(cls)) {
                      handleAddClass(cls);
                    }
                  });

                  lastProcessedClasses = currentClasses;
                }
              }
            } catch (parseError) {
              console.error("Failed to parse SSE data:", parseError);
            }
          }
        }
      }

      setToast({
        type: "success",
        message: "Successfully updated styles!",
      });
    } catch (error) {
      console.error("Stream error:", error);
      setToast({
        type: "error",
        message: "Failed to generate classes. Please try again.",
      });
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  return (
    <div
      ref={floatingWindowRef}
      className={`floating-window border-none bg-white shadow-lg ${
        isFixed ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: isFixed ? "absolute" : "fixed",
        zIndex: 2147483647,
      }}
      onMouseDown={handleDivMouseDown}
    >
      <FloatingWindowHeader
        ref={headerRef}
        isFixed={isFixed}
        isDragging={isDragging}
        onCopyClasses={handleCopyClasses}
        onCopyElement={handleCopyElement}
        onDeactivate={onDeactivate}
        isAIMode={isAIMode}
        onAIModeChange={setIsAIMode}
      />
      <div className="px-3 pb-3">
        {onElementSelect && (
          <ElementNavigation
            element={element}
            onElementSelect={onElementSelect}
          />
        )}
        <ClassList
          classes={classes}
          element={element}
          onToggle={handleClassToggle}
          onRemove={handleRemoveClass}
        />
        {isAIMode ? (
          <form onSubmit={handlePromptSubmit}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className={`w-full mt-2 bg-white border border-gray-300 focus:ring-1 focus:ring-[#1DA1F2] focus:outline-none shadow-sm p-1.5 rounded text-xs placeholder-[#657786] transition duration-150 ease-in-out ${
                isGenerating ? "opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder={
                isGenerating
                  ? "Generating..."
                  : "Describe the styles you want..."
              }
            />
          </form>
        ) : (
          <AutoComplete
            options={autocompleteResults}
            onSelect={handleAddClass}
            onInputChange={handleInputChange}
            inputValue={query}
          />
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default FloatingWindow;
