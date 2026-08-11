import { motion } from "motion/react";
import { CameraIcon } from "lucide-react";

// Moody nightlife images for the strip
const STRIP_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1545128485-c400e7702796?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    caption: "Friday nights hit different",
  },
  {
    url: "https://images.unsplash.com/photo-1500217052183-bc01eee1a74e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    caption: "Gastown cocktail hour",
  },
  {
    url: "https://images.unsplash.com/photo-1578736641330-3155e606cd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    caption: "The floor is alive",
  },
  {
    url: "https://images.unsplash.com/photo-1509478861672-91e9a2f90c04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    caption: "Casino lights, River Rock",
  },
  {
    url: "https://images.unsplash.com/photo-1640902106532-47dd3a2e833e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    caption: "Low light, high standards",
  },
  {
    url: "https://images.unsplash.com/photo-1612315476143-904de5b78498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    caption: "Granville Strip glow",
  },
];

export default function InstagramStrip() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <CameraIcon className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold text-foreground">From the Community</h2>
          <span className="text-sm text-muted-foreground ml-1">
            #VanCityNights
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STRIP_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
              whileHover={{ scale: 1.03 }}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                <p className="text-white text-xs font-medium text-center">{img.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}