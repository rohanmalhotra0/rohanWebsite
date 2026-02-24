import React from 'react';
import { File, Folder, Tree } from "@/components/ui/file-tree";
import { Highlighter } from "@/components/ui/highlighter";

export default function Education() {
  return (
    <section id="education" className="w-full bg-white text-black pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="inline-block mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-pixel">
              <Highlighter action="underline" color="#FFD700">
                Education
              </Highlighter>
            </h2>
          </div>
          <div className="relative flex max-w-lg mx-auto flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-4">
            <Tree
              className="w-full bg-background overflow-hidden rounded-md"
              initialExpandedItems={["Education", "NYU", "Coursework", "Graduate Coursework"]}
            >
              <Folder element="My Education" value="Education">
                <Folder element="New York University, Courant Institute" value="NYU">
                  <File value="NYU-Degree">
                    <p>B.S. in Mathematics and Computer Science (May 2027)</p>
                  </File>
                  <File value="NYU-GPA">
                    <p>GPA: 3.75 / 4.00 (Accelerated 3-Year Program)</p>
                  </File>
                  <Folder element="Relevant Coursework" value="Coursework">
                    <File value="Course-Algorithms"><p>Algorithms</p></File>
                    <File value="Course-OS"><p>Operating Systems</p></File>
                    <File value="Course-MVC"><p>Multivariable Calculus</p></File>
                    <File value="Course-LA"><p>Linear Algebra</p></File>
                    <File value="Course-Probability"><p>Probability</p></File>
                    <File value="Course-Statistics"><p>Statistics</p></File>
                    <File value="Course-Numerical"><p>Numerical Methods</p></File>
                  </Folder>
                  <Folder element="Graduate Coursework" value="Graduate Coursework">
                    <File value="Grad-MathTech"><p>Mathematical Techniques for CS Applications</p></File>
                  </Folder>
                </Folder>
              </Folder>
            </Tree>
          </div>
        </div>
      </div>
    </section>
  );
}