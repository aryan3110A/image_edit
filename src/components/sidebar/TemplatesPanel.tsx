'use client';

import { Search } from 'lucide-react';

export function TemplatesPanel() {
    const categories = [
        { name: 'Social Media', templates: ['Instagram Post', 'Story', 'Facebook', 'Twitter'] },
        { name: 'Business', templates: ['Presentation', 'Report', 'Invoice', 'Card'] },
        { name: 'Marketing', templates: ['Flyer', 'Poster', 'Banner', 'Ad'] },
        { name: 'Events', templates: ['Invitation', 'RSVP', 'Ticket', 'Program'] },
        { name: 'Education', templates: ['Worksheet', 'Certificate', 'Infographic', 'Resume'] },
        { name: 'Personal', templates: ['Birthday', 'Holiday', 'Thank You', 'Greeting'] },
    ];

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-gray-800 font-semibold text-lg">Templates</h2>
                <div className="mt-3 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                </div>
            </div>

            {/* Scrollable Content with custom scrollbar */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {categories.map((category, categoryIndex) => (
                    <div key={category.name} className={categoryIndex < categories.length - 1 ? 'mb-6' : ''}>
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                            {category.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {category.templates.map((template, i) => (
                                <div
                                    key={i}
                                    className="aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:border-violet-400 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group"
                                >
                                    {/* Template Preview Placeholder */}
                                    <div className="w-full h-3/4 bg-gradient-to-br from-violet-50 to-blue-50 rounded-t-lg flex items-center justify-center">
                                        <span className="text-violet-300 text-2xl font-light">
                                            {template.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="w-full h-1/4 flex items-center justify-center px-2">
                                        <span className="text-gray-600 text-[10px] font-medium text-center truncate group-hover:text-violet-600 transition-colors">
                                            {template}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
