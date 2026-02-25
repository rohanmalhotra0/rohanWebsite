import React from 'react';
import { Highlighter } from "@/components/ui/highlighter";
import { EducationShowcase } from "@/components/ui/education-showcase";

export default function Education() {
  return (
    <section id="education" className="w-full bg-white text-black pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="inline-block mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-pixel underline-wavy-yellow">
              <Highlighter action="underline" color="#FFD700">
                Education
              </Highlighter>
            </h2>
          </div>
          <div className="mx-auto max-w-4xl">
            <EducationShowcase
              school="New York University, Courant Institute"
              program="B.A. Mathematics & Computer Science (Accelerated 3-Year Program)"
              graduation="Graduating May 2027"
              gpa="3.75 / 4.00"
              location="New York, NY"
              highlights={[
                "Accelerated 3-year program with a combined math + CS curriculum centered on proofs, algorithms, and systems.",
                "Coursework emphasis: optimization + numerical methods for computation, plus probability/statistics for uncertainty and inference.",
              ]}
              relevantCoursework={[
                "Algorithms",
                "Operating Systems",
                "Computer Organization",
                "Data Structures",
                "Discrete Mathematics",
                "Software Engineering",
                "Machine Learning",
                "Multivariable Calculus",
                "Linear Algebra",
                "Probability Theory",
                "Statistics",
                "Real Analysis",
                "Abstract Algebra",
                "Differential Equations",
                "Numerical Methods",
              ]}
              graduateCoursework={[
                "Mathematical Techniques for CS Applications",
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}