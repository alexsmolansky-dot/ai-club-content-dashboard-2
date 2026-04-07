export interface Idea {
  id: string;
  title: string;
  description: string;
  pillar:
    | "education"
    | "community"
    | "industry"
    | "events"
    | "behind-the-scenes"
    | "tools";
  votes: number;
  status: "new" | "approved" | "in-progress";
}

export const ideas: Idea[] = [];