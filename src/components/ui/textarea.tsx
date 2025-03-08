import * as React from "react"

import { cn } from "@/lib/utils/ui"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoExpand?: boolean;
}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, autoExpand, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  
  // Merge refs
  const handleRef = React.useCallback((element: HTMLTextAreaElement | null) => {
    textareaRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  }, [ref]);
  
  // Function to adjust height
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height temporarily to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to the scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);
  
  // Adjust height on input when autoExpand is true
  React.useEffect(() => {
    if (!autoExpand) return;
    
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Initial height adjustment
    adjustHeight();
    
    // Add event listener for input
    const handleInput = () => adjustHeight();
    textarea.addEventListener('input', handleInput);
    
    // Clean up
    return () => {
      textarea.removeEventListener('input', handleInput);
    };
  }, [autoExpand, adjustHeight]);
  
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={handleRef}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea } 