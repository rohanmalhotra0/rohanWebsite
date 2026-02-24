import React from 'react';
import { File, Folder, Tree } from "@/components/ui/file-tree";
import { Highlighter } from "@/components/ui/highlighter";

export default function Certifications() {
  return (
    <section id="certifications" className="w-full bg-white text-black py-20">
      <div className="container mx-auto px-4">
        {/* This div creates the side-by-side layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Certifications Column (First Item in Grid) */}
          <div className="text-center">
            <div className="inline-block mb-12">
              <h2 className="text-4xl md:text-5xl font-bold font-pixel">
                <Highlighter action="underline" color="#FFD700">
                  Certifications 🎖️
                </Highlighter>
              </h2>
            </div>
            <div className="relative flex max-w-lg mx-auto flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-4">
              <Tree
                className="w-full bg-background overflow-hidden rounded-md"
                initialExpandedItems={["Certifications", "Cisco", "IBM", "AWS"]}
              >
                <Folder element="My Certifications" value="Certifications">
                  <Folder element="Cisco" value="Cisco">
                    <File value="Cisco-Intro">
                      <p>Introduction to Cybersecurity</p>
                    </File>
                    <File value="Cisco-Jr">
                      <p>Jr. Cybersecurity Analyst</p>
                    </File>
                  </Folder>
                  <Folder element="IBM" value="IBM">
                    <File value="IBM-Python">
                      <p>Python 101 for Data Science</p>
                    </File>
                  </Folder>
                  <Folder element="AWS" value="AWS">
                    <File value="AWS-Cloud">
                      <p>Cloud Foundations (AWS Academy Graduate)</p>
                    </File>
                  </Folder>
                </Folder>
              </Tree>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}