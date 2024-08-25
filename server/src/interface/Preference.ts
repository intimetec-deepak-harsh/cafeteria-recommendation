export interface Preference {
    preference_id: number;
    user_id: number;
    dietary_preference: "vegetarian" | "non-vegetarian" | "eggetarian";
    spice_level: "high" | "medium" | "low";
    cuisine_preference: "north-indian" | "south-indian" | "other";
    sweet_tooth: boolean;
  }