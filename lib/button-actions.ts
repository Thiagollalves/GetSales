import { toast } from "sonner";

export function notifyAction(title: string, description?: string) {
  if (description) {
    toast.message(title, { description });
    return;
  }

  toast.message(title);
}
