import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Feature {
  step: string;
  title?: string;
  content: string;
  image: string;
}

interface FeatureStepsProps {
  features: Feature[];
  className?: string;
  title?: string;
  autoPlayInterval?: number;
}

const FeatureSteps: React.FC<FeatureStepsProps> = ({
  features,
  className,
  title = "How it works",
  autoPlayInterval = 4000,
}) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset progress to 0, then start filling on next frame
    setProgress(0);
    const frameId = requestAnimationFrame(() => {
      setProgress(100);
    });

    const timer = setTimeout(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, autoPlayInterval);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, [currentFeature, features.length, autoPlayInterval]);

  return (
    <div className={cn("px-6 md:px-12", className)}>
      <div className="max-w-5xl mx-auto w-full">

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Steps list */}
          <div className="order-2 md:order-1 space-y-4 flex flex-col justify-between">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                type="button"
                className="flex items-start gap-4 md:gap-6 w-full text-left cursor-pointer"
                initial={{ opacity: 0.35 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.35 }}
                transition={{ duration: 0.4 }}
                onClick={() => {
                  setCurrentFeature(index);
                  setProgress(0);
                }}
              >
                {/* Step indicator */}
                <motion.div
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0 mt-1.5 transition-colors duration-300",
                    index === currentFeature
                      ? "bg-primary"
                      : index < currentFeature
                        ? "bg-primary/40"
                        : "bg-border"
                  )}
                />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg md:text-xl text-foreground leading-snug">
                    {feature.title || feature.step}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-1">
                    {feature.content}
                  </p>

                  {/* Progress bar for active step */}
                  {index === currentFeature && (
                    <div className="mt-3 h-0.5 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/50 rounded-full"
                        style={{
                          width: `${progress}%`,
                          transition: progress === 0 ? 'none' : `width ${autoPlayInterval}ms linear`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Image panel */}
          <div className="order-1 md:order-2 relative h-[220px] md:h-[320px] lg:h-[400px] w-full overflow-hidden rounded-xl card-glass">
            <AnimatePresence initial={false}>
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-xl overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.step}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/60 to-transparent" />
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSteps;
