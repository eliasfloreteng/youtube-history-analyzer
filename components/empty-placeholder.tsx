import type React from "react"
import { Youtube } from "lucide-react"

interface EmptyPlaceholderProps {
  children: React.ReactNode
}

export function EmptyPlaceholder({ children }: EmptyPlaceholderProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

interface EmptyPlaceholderIconProps {
  name: string
}

EmptyPlaceholder.Icon = function EmptyPlaceholderIcon({ name }: EmptyPlaceholderIconProps) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
      {name === "youtube" ? (
        <Youtube className="h-10 w-10 text-red-500" />
      ) : (
        <div className="h-10 w-10 bg-muted-foreground/10" />
      )}
    </div>
  )
}

interface EmptyPlaceholderTitleProps {
  children: React.ReactNode
}

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({ children }: EmptyPlaceholderTitleProps) {
  return <h2 className="mt-6 text-xl font-semibold">{children}</h2>
}

interface EmptyPlaceholderDescriptionProps {
  children: React.ReactNode
}

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({ children }: EmptyPlaceholderDescriptionProps) {
  return <p className="mt-3 mb-8 text-center text-sm font-normal leading-6 text-muted-foreground">{children}</p>
}
