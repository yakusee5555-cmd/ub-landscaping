export const business = {
  name: "U&B Landscaping and Tree Service",
  shortName: "U&B",
  phone: "(917) 417-0195",
  phoneHref: "tel:+19174170195",
  address: "139-09 91st Ave, Jamaica, NY 11435",
  tagline: "Outdoor spaces, properly cared for.",
};

export const media = {
  lawn: "/images/lawn.jpg",
  hedge: "/images/hedge.jpg",
  shrub: "/images/shrub.jpg",
  trim: "/images/trim.jpg",
  whyChooseUs: "/images/why-choose-us.jpg",
  fence: "/images/fence.jpg",
  lawnInstall: "/images/lawn-install.jpg",
  cleanup: "/images/cleanup.jpg",
  lawnCare: "/images/lawn-care.webp",
  feeding: "/images/feeding.webp",
  brush: "/images/brush.webp",
  video: "/videos/hero.mp4",
};
export const services = [
  { title: "Landscaping", description: "Complete lawn and landscape care that keeps your whole property looking sharp.", image: media.lawnCare, price: "From $55" },
  { title: "Irrigation", description: "Sprinkler installs and repairs that keep everything green without wasting water.", image: media.lawnInstall, price: "From $149" },
  { title: "Landscape design", description: "Planting plans with year-round color, texture and practical maintenance in mind.", image: media.shrub, price: "From $499" },
  { title: "Tree trimming", description: "Careful pruning that keeps trees healthy, safe and beautifully shaped.", image: media.trim, price: "From $299" },
  { title: "Tree removal", description: "Safe, clean removal of dead or dangerous trees — stumps handled too.", image: media.brush, price: "From $1,499" },
  { title: "Canopy cleaning", description: "Deadwood and debris cleared from tree canopies for health and curb appeal.", image: media.cleanup, price: "From $199" },
];
export const nav = [{to:"#home",label:"Home"},{to:"#services",label:"Services"},{to:"#plan-my-yard",label:"Plan My Yard"},{to:"#about",label:"About"},{to:"#contact",label:"Contact"}] as const;
export const whatsappUrl = "https://wa.me/19174170195?text=Hello%20U%26B%20Landscaping%20and%20Tree%20Service%2C%20I%27d%20like%20a%20free%20quote.";
