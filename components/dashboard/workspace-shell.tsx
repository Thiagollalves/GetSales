import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface WorkspaceShellProps {
  title: string
  description?: string
  actions?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function WorkspaceShell({
  title,
  description,
  actions,
  toolbar,
  children,
  className,
  contentClassName,
}: WorkspaceShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
        className,
      )}
    >
      <section className="rounded-[30px] border border-border/60 bg-card/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>

        {toolbar ? <div className="mt-4">{toolbar}</div> : null}
      </section>

      <div className={cn("min-h-0 flex-1", contentClassName)}>{children}</div>
    </div>
  )
}
