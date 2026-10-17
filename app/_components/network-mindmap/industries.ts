export interface Industry {
  id: string;
  label: string;
  color: string;
}

export const CONSUMER_NODE = {
  id: "consumer",
  label: "Consumer",
  color: "#f5f7ff",
} as const;

export const INDUSTRIES: Industry[] = [
  { id: "food", label: "Food", color: "#ff8a5c" },
  { id: "fashion", label: "Fashion", color: "#ff5fa8" },
  { id: "land", label: "Land", color: "#b08968" },
  { id: "education", label: "Education", color: "#4fc3f7" },
  { id: "healthcare", label: "Healthcare", color: "#4caf7d" },
  { id: "transport", label: "Transport", color: "#ffb74d" },
  { id: "tech", label: "Tech", color: "#7c6cff" },
  { id: "entertainment", label: "Entertainment", color: "#f06292" },
];
