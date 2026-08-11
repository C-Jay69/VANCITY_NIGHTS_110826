import { MapPinIcon, LinkIcon, Share2Icon } from "lucide-react";

const FOOTER_LINKS = {
  Explore: ["Bars", "Clubs", "Casinos", "Lounges", "Featured", "Near Me"],
  Neighbourhoods: ["Gastown", "Downtown", "Granville Strip", "Chinatown", "Richmond", "Burnaby"],
  Community: ["Submit a Spot", "Write a Review", "Report Incorrect Info", "Advertise"],
  Legal: ["Privacy Policy", "Terms of Use", "Cookie Policy"],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <MapPinIcon className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">
                <span className="text-primary">VanCity</span>
                <span className="text-accent">Nights</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              The community-powered nightlife directory for Vancouver&apos;s Lower Mainland.
              No PR fluff. Just honest spots, rated by the people who actually go.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                <Share2Icon className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <LinkIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-3">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {year} VanCityNights. All rights reserved. Vancouver Lower Mainland, BC.
          </p>
          <p className="text-xs text-muted-foreground italic">
            &ldquo;Survive YVR Nights Without Regrets.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}