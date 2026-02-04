import React from 'react';
import { Github, Linkedin, Twitter, Sparkles, Code2, Globe } from 'lucide-react';

const SocialLink = ({ href, icon: Icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
        title={label}
    >
        <Icon className="w-5 h-5" />
    </a>
);

const DeveloperCard = ({ dev, index }) => {
    const isEven = index % 2 === 0;

    return (
        <div className="relative w-full max-w-5xl mx-auto mb-20 last:mb-0">
            <div className={`flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                {/* Image Section - Large & Prominent */}
                <div className="w-full md:w-1/2 lg:w-3/5 h-[400px] md:h-[500px] relative z-0">
                    <img
                        src={dev.image}
                        alt={dev.name}
                        className="w-full h-full object-cover rounded-2xl shadow-lg grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                    />
                    {/* Decorative Background Element */}
                    <div className={`absolute -bottom-4 ${isEven ? '-left-4' : '-right-4'} w-full h-full border-2 border-primary-100 dark:border-primary-900/30 rounded-2xl -z-10 hidden md:block`}></div>
                </div>

                {/* Overlapping Content Box */}
                <div className={`
                    w-11/12 md:w-1/2 lg:w-2/5 
                    -mt-20 md:mt-0 
                    ${isEven ? 'md:-ml-16 lg:-ml-24' : 'md:-mr-16 lg:-mr-24'} 
                    z-10
                `}>
                    <div className="bg-white dark:bg-neutral-800 p-8 md:p-10 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">

                        {/* Role Badge */}
                        <div className="mb-4">
                            <span className="inline-block py-1 px-3 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
                                {dev.role}
                            </span>
                        </div>

                        {/* Name */}
                        <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                            {dev.name}
                        </h3>

                        {/* Bio */}
                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                            {dev.bio}
                        </p>

                        {/* Divider */}
                        <div className="h-px w-16 bg-primary-200 dark:bg-primary-800 mb-6"></div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {dev.skills.map((skill, i) => (
                                <span key={i} className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                                    #{skill}
                                </span>
                            ))}
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {dev.links.github && <SocialLink href={dev.links.github} icon={Github} label="GitHub" />}
                            {dev.links.linkedin && <SocialLink href={dev.links.linkedin} icon={Linkedin} label="LinkedIn" />}
                            {dev.links.twitter && <SocialLink href={dev.links.twitter} icon={Twitter} label="X (Twitter)" />}
                            {dev.links.website && <SocialLink href={dev.links.website} icon={Globe} label="Website" />}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default function Developers() {
    // 3 Developers + 1 Mentor
    const team = [
        {
            name: "Snehal Kushwah",
            role: "Lead Developer",
            image: "/images/snehal.jpg?v=1",
            bio: "Architecting the future of digital organization. I drive the core technical vision of Stashly, focusing on scalable systems and intuitive user experiences.",
            skills: ["React", "Node.js", "Express.js", "MongoDB"],
            links: { github: "https://github.com/http-snehal", linkedin: "https://www.linkedin.com/in/snehal-kushwah-492a70326/", website: "https://http-snehal.github.io/portfolio/" }
        },
        {
            name: "Rex Mantode",
            role: "Secondary Developer",
            image: "/images/rex.jpeg?v=1",
            bio: "I design and build pixel-perfect user interfaces using React, supported by Node.js and MongoDB, with a strong emphasis on performance, accessibility, and delivering thoughtful, high-quality user experiences.",
            skills: ["React", "Node.js", "MongoDB"],
            links: { github: "#", linkedin: "https://www.linkedin.com/in/rex-mantode13/" }
        },
        {
            name: "Rishabh Malviya",
            role: "Secondary Developer",
            image: "/images/rishabh.jpeg?v=1",
            bio: "Building the robust infrastructure that powers Stashly. Sarah specializes in database optimization, API security, and high-performance server logic.",
            skills: ["Express", "MongoDB", "HTML"],
            links: { github: "#", twitter: "#" }
        },
        {
            name: "Prof. Sudha Kore",
            role: "Project Mentor",
            image: "--",
            bio: "To be updated",
            skills: ["Leadership", "Strategy", "Mentorship"],
            links: { linkedin: "#", website: "#" }
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm mb-6">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                            Our Creative Team
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-6">
                        Meet the <span className="text-primary-600">Innovators</span>
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        A dedicated team of developers and mentors working together to redefine how you manage digital resources.
                    </p>
                </div>

                {/* Alternating Grid */}
                <div className="space-y-12 md:space-y-24">
                    {team.map((dev, index) => (
                        <DeveloperCard key={index} dev={dev} index={index} />
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-24 pt-12 border-t border-neutral-200 dark:border-neutral-800 text-center">
                    <p className="text-neutral-400 text-sm flex items-center justify-center gap-2">
                        <Code2 className="w-4 h-4" />
                        <span>Proudly built by the Stashly Team</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
