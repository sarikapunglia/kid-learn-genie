import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label?: string;
}

const StarRating = ({ rating, onRatingChange, label }: StarRatingProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                star <= rating
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground/40 hover:text-primary/60"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarRating;
