"use client"

import React, { useState } from 'react';
import GlareHover from './GlareHover';
import { Highlighter } from "@/components/ui/highlighter";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { cn } from "@/lib/utils";
import { projects, research, workExperience } from '../data/portfolioData';

function clampStyles(lines) {
    return {
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    };
}

const Card = ({ item }) => {
    const tags = item.tags || [];
    const visibleTags = tags.slice(0, 4);
    const extraCount = Math.max(0, tags.length - visibleTags.length);

    return (
    <GlareHover
        glareColor="#ffffff"
        glareOpacity={0.3}
        glareAngle={-30}
        glareSize={300}
        transitionDuration={1350}
        playOnce={true}
        width="100%"
        height="100%"
        background="#fff"
        borderRadius="16px"
        className="h-full"
        style={{ border: '1px solid #e5e7eb' }}
    >
        <div className="flex flex-col h-full bg-white rounded-[16px] overflow-hidden">
            {item.videoUrl ? (
                <video
                    src={item.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-36 object-cover"
                    poster={item.imageUrl}
                />
            ) : (
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className={[
                        "w-full h-36",
                        item.imageFit === 'contain' ? "object-contain p-6 bg-white" : "object-cover",
                    ].join(' ')}
                />
            )}
            <div className="p-4 flex-grow flex flex-col">
                <h3
                    className="text-lg font-bold text-gray-900 mb-1"
                    style={clampStyles(2)}
                >
                    {item.title}
                </h3>
                <div className="flex flex-wrap gap-1 mb-2">
                    {visibleTags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-gray-200 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                    {extraCount > 0 && (
                        <span className="bg-gray-200 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            +{extraCount}
                        </span>
                    )}
                </div>
                <p
                    className="text-gray-600 text-xs mb-2"
                    style={clampStyles(3)}
                >
                    {item.description}
                </p>
                <div className="flex items-center justify-start space-x-3 mt-auto pt-1">
                    {item.liveUrl && (
                        <a
                            href={item.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors duration-300"
                        >
                            {item.primaryCtaLabel || 'View'}
                        </a>
                    )}
                    {item.repoUrl && item.repoUrl !== '#' && (
                        <a
                            href={item.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 font-semibold text-xs transition-colors duration-300"
                        >
                            View Code
                        </a>
                    )}
                </div>
            </div>
        </div>
    </GlareHover>
    );
};

// --- Main Projects Section Component ---
export default function Projects() {
    const [showAll, setShowAll] = useState(false);
    const displayedProjects = showAll ? projects : projects.slice(0, 3);

    return (
        <section
            id="projects"
            // --- 1. Added bg-white (or bg-background) here ---
            className="relative w-full text-black py-20 overflow-hidden bg-white"
        >
            <InteractiveGridPattern
                className={cn(
                    "absolute inset-0 h-full w-full",
                    "[mask-image:radial-gradient(1400px_circle_at_center,white,transparent)]"
                )}
                // --- 2. Added the missing props from your demo ---
                width={20}
                height={20}
                squares={[80, 80]}
                // You can set a static color for the squares
                squaresClassName="fill-transparent stroke-gray-300/40"
            />

            <div className="relative z-10 px-2">
                <div className="text-center mb-12">
                    <h2 className="text-5xl font-bold font-pixel underline-wavy-yellow inline-block">
                        <Highlighter action="underline" color="#FFD700">
                            Work Experience
                        </Highlighter>
                    </h2>
                </div>
                <div className="grid grid-cols-3 gap-6 max-w-screen-lg mx-auto">
                    {workExperience.map((item) => (
                        <div key={item.title} className="aspect-square">
                            <Card item={item} />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-20 mb-10">
                    <h2 className="text-5xl font-bold font-pixel underline-wavy-yellow inline-block">
                        <Highlighter action="underline" color="#FFD700">
                            Research
                        </Highlighter>
                    </h2>
                </div>
                <div className="grid grid-cols-3 gap-6 max-w-screen-lg mx-auto">
                    {research.map((item) => (
                        <div key={item.title} className="aspect-square">
                            <Card item={item} />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-20 mb-12">
                    <h2 className="text-5xl font-bold font-pixel underline-wavy-yellow inline-block">
                        <Highlighter action="underline" color="#FFD700">
                            Projects
                        </Highlighter>
                    </h2>
                </div>
                <div className="grid grid-cols-3 gap-6 max-w-screen-lg mx-auto">
                    {displayedProjects.map((item) => (
                        <div key={item.title} className="aspect-square">
                            <Card item={item} />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    {!showAll && projects.length > 3 && (
                        <button onClick={() => setShowAll(true)} className="btn">
                            View More
                        </button>
                    )}
                    {showAll && (
                        <button onClick={() => setShowAll(false)} className="btn">
                            View Less
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}