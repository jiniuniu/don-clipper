import { Id } from "../convex/_generated/dataModel";

export interface Session {
  _id: Id<"sessions">;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Explanation {
  _id: Id<"explanations">;
  sessionId: Id<"sessions">;
  question: string;
  svgCode?: string;
  explanation?: string;
  relatedPhenomena?: string[];
  furtherQuestions?: string[];
  status:
    | "generating"
    | "content_completed"
    | "svg_generating"
    | "completed"
    | "failed";
  createdAt: number;
  isPublic?: boolean;
  category?: string;
  subcategory?: string;
}
