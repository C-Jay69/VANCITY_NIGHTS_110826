import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { motion } from "motion/react";
import { StarIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";

type Props = {
  venueId: Id<"venues">;
  onReviewed?: () => void;
};

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer transition-transform hover:scale-110"
          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
        >
          <StarIcon
            className={`h-7 w-7 transition-colors ${
              s <= display
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: "Avoid at all costs",
  2: "Needs work",
  3: "Decent enough",
  4: "Solid spot",
  5: "Absolutely ace",
};

function ReviewFormInner({ venueId, onReviewed }: Props) {
  const existingReview = useQuery(api.reviews.getMyReview, { venueId });
  const upsertReview = useMutation(api.reviews.upsertReview);

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [text, setText] = useState(existingReview?.text ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Sync state when existing review loads
  if (existingReview && rating === 0 && existingReview.rating > 0) {
    setRating(existingReview.rating);
    setText(existingReview.text);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Pick a star rating first");
      return;
    }
    if (text.trim().length < 5) {
      toast.error("Say a bit more — at least 5 characters");
      return;
    }
    setSubmitting(true);
    try {
      await upsertReview({ venueId, rating, text: text.trim() });
      toast.success(existingReview ? "Review updated!" : "Review posted!");
      setDone(true);
      onReviewed?.();
    } catch (err) {
      if (err instanceof ConvexError) {
        const { message } = err.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground"
      >
        <span className="text-primary font-semibold">Review posted.</span>{" "}
        Thanks for keeping YVR nights honest.{" "}
        <button
          onClick={() => setDone(false)}
          className="text-primary underline cursor-pointer ml-1"
        >
          Edit it
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-foreground">
        {existingReview ? "Update Your Review" : "Leave a Review"}
      </h3>

      {/* Star picker */}
      <div>
        <StarPicker value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {RATING_LABELS[rating]}
          </p>
        )}
      </div>

      {/* Text */}
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="What was the vibe? Would you go back? Any tips for first-timers?"
          className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
        />
      </div>

      <Button type="submit" disabled={submitting} size="sm" className="gap-2">
        <SendIcon className="h-3.5 w-3.5" />
        {submitting ? "Posting..." : existingReview ? "Update Review" : "Post Review"}
      </Button>
    </form>
  );
}

export default function ReviewForm({ venueId, onReviewed }: Props) {
  return (
    <>
      <Authenticated>
        <ReviewFormInner venueId={venueId} onReviewed={onReviewed} />
      </Authenticated>
      <Unauthenticated>
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to rate and review this spot
          </p>
          <SignInButton />
        </div>
      </Unauthenticated>
    </>
  );
}