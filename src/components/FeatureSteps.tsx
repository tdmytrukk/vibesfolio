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
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  return (
    <div className={cn("px-6 md:px-12", className)}>
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="font-heading text-2xl md:text-4xl text-foreground mb-10 text-center">
          {title}
        </h2>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Steps list */}
          <div className="order-2 md:order-1 space-y-6">
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
                    "w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 shrink-0 mt-0.5 transition-colors duration-300",
                    index === currentFeature
                      ? "bg-primary border-primary text-primary-foreground"
                      : index < currentFeature
                        ? "bg-primary/20 border-primary/40 text-foreground"
                        : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {index < currentFeature ? (
                    <span className="text-sm font-semibold">✓</span>
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg md:text-xl text-foreground leading-snug">
                    {feature.title || feature.step}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-1">
                    {feature.content}
                  </p>

                  {/* Progress bar for active step */}
                  {index === currentFeature && (
                    <div className="mt-3 h-0.5 w-full bg-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary/50 rounded-full"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Image panel */}
          <div className="order-1 md:order-2 relative h-[220px] md:h-[320px] lg:h-[400px] w-full overflow-hidden rounded-xl card-glass">
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-xl overflow-hidden"
                      initial={{ y: 80, opacity: 0, rotateX: -15 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -80, opacity: 0, rotateX: 15 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
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
