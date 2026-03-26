import dynamic from "next/dynamic"

const PipelineBoard = dynamic(
  () => import("@/components/dashboard/pipeline/board"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-muted-foreground">
        Carregando pipeline...
      </div>
    ),
  }
)

export default function PipelinePage() {
  return <PipelineBoard />
}
