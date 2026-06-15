"use client";

import { motion } from "framer-motion";
import { PhotoSlot } from "@/components/PhotoSlot";

const EASE = [0.22, 1, 0.36, 1] as const;

export function GalleryGrid({
  captions,
}: {
  captions: string[];
}) {
  return (
    <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
      {captions.map((caption, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: EASE, delay: (i % 4) * 0.08 }}
        >
          <PhotoSlot
            label={caption}
            code={`G${i + 1}`}
            ratio={i % 3 === 0 ? "3:4" : "1:1"}
            variant={i}
            className={i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}
          />
        </motion.div>
      ))}
    </div>
  );
}
