import * as React from "react"
import { motion } from "motion/react"
import { GraduationCap, MapPin, Stars } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GridPattern } from "@/components/ui/grid-pattern"
import { ScrollArea } from "@/components/ui/scroll-area"

export type EducationShowcaseProps = {
  school: string
  program: string
  graduation: string
  gpa?: string
  location?: string
  relevantCoursework: string[]
  graduateCoursework?: string[]
  highlights?: string[]
  className?: string
}

export function EducationShowcase({
  school,
  program,
  graduation,
  gpa,
  location,
  relevantCoursework,
  graduateCoursework = [],
  highlights = [],
  className,
}: EducationShowcaseProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-gray-200 bg-white shadow-lg",
        className
      )}
    >
      <GridPattern
        width={36}
        height={36}
        x={-1}
        y={-1}
        className="[mask-image:radial-gradient(340px_circle_at_50%_40%,white,transparent)]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-100/40 via-transparent to-transparent" />

      <CardHeader className="relative">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <CardTitle className="text-xl sm:text-2xl text-gray-900">
              {school}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              <span>{graduation}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm sm:text-base text-gray-700">{program}</p>
            {gpa ? (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-800 border border-gray-200"
              >
                GPA {gpa}
              </Badge>
            ) : null}
            {location ? (
              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {location}
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
            transition={{ duration: 0.35 }}
            className="rounded-xl border border-gray-200 bg-white/70 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <Stars className="h-4 w-4 text-black" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-gray-900">
                Highlights
              </h3>
            </div>

            <ul className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
              {(highlights.length
                ? highlights
                : [
                    "Algorithms + systems focus with research-driven engineering.",
                    "Accelerated path with a heavy math + CS workload.",
                  ]
              ).map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="rounded-xl border border-gray-200 bg-white/70 p-4 backdrop-blur-sm"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              Relevant coursework
            </h3>
            <ScrollArea className="mt-3 h-[120px] pr-3">
              <div className="flex flex-wrap gap-2">
                {relevantCoursework.map((c) => (
                  <Badge
                    key={c}
                    variant="outline"
                    className="border-gray-200 bg-white text-gray-800"
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </ScrollArea>

            {graduateCoursework.length ? (
              <>
                <h4 className="mt-4 text-sm font-semibold text-gray-900">
                  Graduate coursework
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {graduateCoursework.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="border-gray-200 bg-white text-gray-800"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}

