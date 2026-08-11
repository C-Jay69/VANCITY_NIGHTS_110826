import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { SearchIcon, PenLineIcon, ShieldCheckIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

const STEPS = [
  {
    icon: PenLineIcon,
    step: "01",
    title: "Submit a Spot",
    desc: "Know a killer bar, dive worth visiting, or a casino that deserves more love? Fill in a quick form — name, address, why it slaps.",
    color: "text-primary",
    glow: "bg-primary/10 border-primary/20",
  },
  {
    icon: ShieldCheckIcon,
    step: "02",
    title: "We Moderate",
    desc: "Our team cleans up the drivel, adds pro graphics or stock photography, and publishes with full credit to you.",
    color: "text-accent",
    glow: "bg-accent/10 border-accent/20",
  },
  {
    icon: StarIcon,
    step: "03",
    title: "Community Rates",
    desc: "Real Vancouverites rate and review every spot. Nightlife shifts fast — the community keeps it fresh.",
    color: "text-yellow-400",
    glow: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: SearchIcon,
    step: "04",
    title: "You Discover",
    desc: "Browse by category, neighbourhood, or tonight's vibe. Find somewhere worth the cover charge.",
    color: "text-green-400",
    glow: "bg-green-400/10 border-green-400/20",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-card/20 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">
            Community-Driven
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">
            How VanCityNights Works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm">
            Nightlife shifts faster than a millennial&apos;s job. That&apos;s why we let the community
            do the heavy lifting — with a little quality control from us.
          </p>
          <div className="mt-6">
            <Link to="/submit">
              <Button className="gap-2">
                <PenLineIcon className="h-4 w-4" />
                Submit a Spot
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
              className={`relative p-6 rounded-xl border ${step.glow}`}
            >
              <div className="text-6xl font-black text-white/5 absolute top-3 right-4 leading-none select-none">
                {step.step}
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${step.glow} mb-4`}>
                <step.icon className={`h-5 w-5 ${step.color}`} />
              </div>
              <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}