import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye } from "lucide-react";

interface ProfileVisibilityPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const ProfileVisibilityPrompt = ({
  open,
  onOpenChange,
  onConfirm,
}: ProfileVisibilityPromptProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Eye size={22} className="text-muted-foreground" />
        </div>
        <AlertDialogTitle className="font-heading text-center">
          Make your profile visible?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center text-sm leading-relaxed">
          Your profile is currently private. To publish content to the community,
          your profile needs to be visible.{" "}
          <span className="font-medium text-foreground">
            Only your published content will be shown
          </span>{" "}
          — your private ideas, prompts, and resources stay hidden.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="sm:justify-center gap-2 mt-2">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>
          Yes, make visible &amp; publish
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ProfileVisibilityPrompt;
