import { useState } from 'react';

export function Attribution() {
    const [isOpen, setIsOpen] = useState(false);

    const assets = [
        {
            name: "Ankh.svg",
            author: "F l a n k e r",
            license: "Public Domain",
            url: "https://commons.wikimedia.org/wiki/File:Ankh.svg"
        },
        {
            name: "Water_hieroglyph.svg",
            author: "F l a n k e r",
            license: "Public Domain",
            url: "https://commons.wikimedia.org/wiki/File:Water_hieroglyph.svg"
        },
        {
            name: "Feather_of_maat.svg",
            author: "Jeff Dahl",
            license: "CC BY-SA 4.0",
            url: "https://commons.wikimedia.org/wiki/File:Feather_of_maat.svg"
        },
        {
            name: "Sun_disk.svg",
            author: "F l a n k e r",
            license: "Public Domain",
            url: "https://commons.wikimedia.org/wiki/File:Sun_disk.svg"
        },
        {
            name: "Horus_as_falcon.svg",
            author: "Jeff Dahl",
            license: "CC BY-SA 4.0",
            url: "https://commons.wikimedia.org/wiki/File:Horus_as_falcon.svg"
        },
        {
            name: "Anubis_standing.svg",
            author: "Jeff Dahl",
            license: "CC BY-SA 4.0",
            url: "https://commons.wikimedia.org/wiki/File:Anubis_standing.svg"
        }
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-1 bg-transparent hover:bg-[#d3ccb8]/20 text-[#d3ccb8] border border-[#d3ccb8]/50 rounded transition-all text-xs opacity-70 hover:opacity-100 uppercase tracking-widest mt-2 md:mt-0"
            >
                Attributions
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#fcf8ed] border-[2px] border-royal-gold/80 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(212,175,55,0.05)] w-full max-w-lg overflow-hidden relative">
                        {/* Motif lines */}
                        <div className="absolute top-2 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-royal-gold to-transparent opacity-60" />

                        <div className="p-8 pb-6 text-[#1a1110]">
                            <h2 className="text-2xl font-serif text-royal-gold font-bold tracking-widest uppercase mb-6 text-center drop-shadow-sm">
                                Artwork Attribution
                            </h2>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                <p className="text-sm font-medium mb-4 italic text-center text-royal-blue/80">
                                    The Royal Style features authentic SVGs from Wikimedia Commons:
                                </p>

                                {assets.map((asset, idx) => (
                                    <div key={idx} className="border-b border-royal-gold/20 pb-3">
                                        <div className="font-bold flex items-center justify-between">
                                            <span>{asset.name}</span>
                                            <span className="text-xs bg-royal-gold/10 px-2 py-0.5 rounded text-royal-gold shadow-sm">{asset.license}</span>
                                        </div>
                                        <div className="text-xs mt-1 text-black/70 flex justify-between">
                                            <span>By: {asset.author}</span>
                                            <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-royal-blue hover:underline">Source Link</a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-8 py-2 bg-royal-gold/10 hover:bg-royal-gold/20 text-royal-blue font-bold tracking-wider uppercase border border-royal-gold/50 rounded-sm transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="absolute bottom-2 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-royal-gold to-transparent opacity-60" />
                    </div>
                </div>
            )}
        </>
    );
}
