import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PenLineIcon,
  MapPinIcon,
  ImageIcon,
  PlusIcon,
  XIcon,
  CheckCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import Navbar from "../_components/Navbar.tsx";
import Footer from "../_components/Footer.tsx";

const NEIGHBORHOODS = [
  "Gastown",
  "Downtown",
  "Granville Strip",
  "Chinatown",
  "Yaletown",
  "West End",
  "Mount Pleasant",
  "Commercial Drive",
  "Richmond",
  "Burnaby",
  "Surrey",
  "New Westminster",
  "North Vancouver",
  "West Vancouver",
  "Coquitlam",
  "Other",
];

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  category: z.enum(["bar", "club", "casino", "lounge"], {
    required_error: "Pick a category",
  }),
  neighborhood: z.string().min(1, "Select a neighbourhood"),
  address: z.string().min(5, "Enter the full street address"),
  description: z
    .string()
    .min(30, "Tell us a bit more — at least 30 characters")
    .max(600),
  whyItsAce: z
    .string()
    .min(10, "Give us the good stuff — at least 10 characters")
    .max(300),
});

type FormValues = z.infer<typeof schema>;

const CATEGORY_OPTIONS = [
  { value: "bar", label: "Bar" },
  { value: "club", label: "Club" },
  { value: "casino", label: "Casino" },
  { value: "lounge", label: "Lounge" },
];

function SubmitForm() {
  const navigate = useNavigate();
  const submitVenue = useMutation(api.submissions.submitVenue);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const selectedCategory = watch("category");

  const addImageField = () => setImageUrls((u) => [...u, ""]);
  const removeImageField = (i: number) =>
    setImageUrls((u) => u.filter((_, idx) => idx !== i));
  const updateImageUrl = (i: number, val: string) =>
    setImageUrls((u) => u.map((v, idx) => (idx === i ? val : v)));

  const onSubmit = async (data: FormValues) => {
    const validUrls = imageUrls.filter((u) => u.trim().length > 0);
    try {
      await submitVenue({ ...data, imageUrls: validUrls });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ConvexError) {
        const { message } = err.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <CheckCircleIcon className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Submission received!
        </h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          Our team will review your spot and publish it with your name attached.
          Thanks for keeping YVR nights alive.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setSubmitted(false)} variant="secondary">
            Submit another spot
          </Button>
          <Button onClick={() => navigate("/venues")}>Browse the directory</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Venue Name <span className="text-destructive">*</span>
        </label>
        <input
          {...register("name")}
          placeholder="e.g. The Blackbird Public House"
          className="w-full px-4 py-2.5 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Category <span className="text-destructive">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                value={opt.value}
                {...register("category")}
                className="sr-only"
              />
              <span
                className={`block px-4 py-2 rounded-full border text-sm font-medium transition-colors select-none ${
                  selectedCategory === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
        {errors.category && (
          <p className="text-xs text-destructive mt-1">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Neighbourhood */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Neighbourhood <span className="text-destructive">*</span>
        </label>
        <select
          {...register("neighborhood")}
          className="w-full px-4 py-2.5 rounded-md bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>
            Select neighbourhood...
          </option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {errors.neighborhood && (
          <p className="text-xs text-destructive mt-1">
            {errors.neighborhood.message}
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Full Address <span className="text-destructive">*</span>
        </label>
        <input
          {...register("address")}
          placeholder="e.g. 165 Water St, Vancouver, BC V6B 1A7"
          className="w-full px-4 py-2.5 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {errors.address && (
          <p className="text-xs text-destructive mt-1">
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Description <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          What&apos;s the vibe? Who goes there? What should someone know before they show up?
        </p>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Dimly lit, expertly crafted cocktails, and zero pretension. The kind of place Gastown does best..."
          className="w-full px-4 py-2.5 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Why it's ace */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Why It&apos;s Ace <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Your hot take. The one thing that makes this spot worth visiting. Be specific.
        </p>
        <textarea
          {...register("whyItsAce")}
          rows={2}
          placeholder="Best Old Fashioned in the city. Go on a rainy Tuesday when it's not packed."
          className="w-full px-4 py-2.5 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
        />
        {errors.whyItsAce && (
          <p className="text-xs text-destructive mt-1">
            {errors.whyItsAce.message}
          </p>
        )}
      </div>

      {/* Image URLs */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Photo URLs{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Paste direct image URLs (from Instagram, Google Maps, the venue&apos;s website, etc).
          We&apos;ll source pro photos too — don&apos;t sweat it.
        </p>
        <div className="space-y-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(i, e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(i)}
                  className="p-2.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 cursor-pointer transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {imageUrls.length < 4 && (
          <button
            type="button"
            onClick={addImageField}
            className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 cursor-pointer transition-colors"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add another photo URL
          </button>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-10">
          {isSubmitting ? "Submitting..." : "Submit Spot"}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Your submission goes to our moderation queue. Once approved, it&apos;ll be
          published with your name: <span className="text-primary">&ldquo;Spotted by @You&rdquo;</span>.
        </p>
      </div>
    </form>
  );
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-8 border-b border-border bg-card/20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <PenLineIcon className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                Community Submissions
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Submit a Spot
            </h1>
            <p className="text-muted-foreground">
              Know somewhere worth the cover charge? Tell us about it. No PR spin —
              just honest intel from real Vancouverites.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Unauthenticated>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <MapPinIcon className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Sign in to submit a spot
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              We credit every submission with your name. Sign in so we know who to thank.
            </p>
            <SignInButton />
          </div>
        </Unauthenticated>

        <Authenticated>
          <SubmitForm />
        </Authenticated>
      </div>

      <Footer />
    </div>
  );
}