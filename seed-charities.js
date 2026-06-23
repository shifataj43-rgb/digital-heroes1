const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  // First, let's clear the old charities so we don't get duplicates
  await supabase.from('charities').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const charities = [
    {
      name: "Global Green",
      description: "Planting trees to offset carbon footprints of golf courses worldwide.",
      image_url: "https://images.unsplash.com/photo-1593111774240-d529f12cb416?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Ocean Clean Initiative",
      description: "Removing plastics from our oceans to preserve marine life for future generations.",
      image_url: "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Youth Sports Link",
      description: "Providing underprivileged youth with access to sports equipment and mentorship.",
      image_url: "https://images.unsplash.com/photo-1535136124503-45eb4dbd0b04?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Veterans on the Green",
      description: "Using golf as a therapeutic outlet for wounded veterans returning home.",
      image_url: "https://images.unsplash.com/photo-1535139262971-c5184570f7d5?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Fairways for Cancer",
      description: "Funding cancer research and patient care through nationwide golf tournaments.",
      image_url: "https://images.unsplash.com/photo-1593111774653-731398ea76d8?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Wildlife Rescue Coalition",
      description: "Protecting endangered wildlife and preserving natural habitats around the globe.",
      image_url: "https://images.unsplash.com/photo-1517594422361-5e18d04cfd8b?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Water for All",
      description: "Building sustainable clean water sources for communities in developing nations.",
      image_url: "https://images.unsplash.com/photo-1519335359740-3375c8793b82?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Education First Fund",
      description: "Providing scholarships, books, and technology to schools in underserved districts.",
      image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Animal Haven",
      description: "Rescuing and rehabilitating abandoned pets and farm animals.",
      image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Disaster Relief Network",
      description: "Delivering emergency food, shelter, and medical supplies to disaster zones.",
      image_url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop"
    }
  ];

  for (const c of charities) {
    await supabase.from('charities').insert([c]);
  }
  console.log("10 Charities seeded successfully.");
}

seed();
