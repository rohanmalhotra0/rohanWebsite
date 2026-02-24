import React, { useState } from 'react';
import { Highlighter } from "@/components/ui/highlighter";
import { projects, research, workExperience } from '../data/portfolioData';
import { Rocket } from 'lucide-react';

export default function ProjectsMobile() {
    const [showAllProjects, setShowAllProjects] = useState(false);
    const displayedProjects = showAllProjects ? projects : projects.slice(0, 3);

    return (
        <section id="projects" className="w-full bg-white text-black py-12 px-2">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold font-pixel underline-wavy-yellow inline-block">
                    <Highlighter action="underline" color="#FFD700">
                        Work Experience
                    </Highlighter>
                </h2>
            </div>

            <div className="flex flex-col gap-6 max-w-md mx-auto">
                {workExperience.map((item) => (
                    <div key={item.title} className="bg-white rounded-xl shadow p-4 flex flex-col">
                        <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-contain bg-white p-6"
                            />
                        </div>
                        <h3 className="text-base font-bold mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-gray-200 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-16 mb-8">
                <h2 className="text-3xl font-bold font-pixel underline-wavy-yellow inline-block">
                    <Highlighter action="underline" color="#FFD700">
                        Research
                    </Highlighter>
                </h2>
            </div>

            <div className="flex flex-col gap-6 max-w-md mx-auto">
                {research.map((item) => (
                    <div key={item.title} className="bg-white rounded-xl shadow p-4 flex flex-col">
                        <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-base font-bold mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {item.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-gray-200 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        {item.liveUrl && (
                            <a
                                href={item.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn !w-auto !h-auto !px-4 !py-2 !text-xs !rounded-lg self-start"
                            >
                                View
                            </a>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center mt-16 mb-8">
                <h2 className="text-3xl font-bold font-pixel underline-wavy-yellow inline-block">
                    <Highlighter action="underline" color="#FFD700">
                        <span className="inline-flex items-center gap-2">
                            Projects
                            <Rocket size={18} aria-hidden="true" />
                        </span>
                    </Highlighter>
                </h2>
            </div>

            <div className="flex flex-col gap-6 max-w-md mx-auto">
                {displayedProjects.map((project) => (
                    <div key={project.title} className="bg-white rounded-xl shadow p-4 flex flex-col">
                        <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                            {project.videoUrl ? (
                                <video
                                    src={project.videoUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                    poster={project.imageUrl}
                                />
                            ) : (
                                <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <h3 className="text-lg font-bold mb-1">{project.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {project.tags && project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-gray-200 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-auto">
                            {project.liveUrl && (
                                <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn !w-auto !h-auto !px-4 !py-2 !text-xs !rounded-lg"
                                >
                                    View
                                </a>
                            )}
                            {project.repoUrl && project.repoUrl !== '#' && (
                                <a
                                    href={project.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn !w-auto !h-auto !px-4 !py-2 !text-xs !rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                                >
                                    View Code
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                {!showAllProjects && projects.length > 3 && (
                    <button onClick={() => setShowAllProjects(true)} className="btn">
                        View More
                    </button>
                )}
                {showAllProjects && (
                    <button onClick={() => setShowAllProjects(false)} className="btn">
                        View Less
                    </button>
                )}
            </div>
        </section>
    );
}