import { useRef, useEffect, useState } from 'react';
import { useSenetStore } from '../engine/store';
import { Square } from './Square';
import { Piece } from './Piece';
import { getSquareNumber } from '../utils/grid';

export function Board() {
    const { board } = useSenetStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const squares = [];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 10; col++) {
            squares.push(getSquareNumber(row, col));
        }
    }

    return (
        <div className="relative w-full max-w-5xl mx-auto border-[16px] border-[#1A1110] rounded-md bg-[#1A1110] shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(0,0,0,0.8)] p-[4px] jitter-stroke">
            {/* Wood texture/grain background overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#2a1b18]/40 to-black/80 mix-blend-multiply pointer-events-none" />

            {/* Edge highlights for joinery illusion */}
            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-sm" />

            {/* Inlaid Ivory Grid Base */}
            <div className="relative bg-[#e8e2d2] p-[2px] rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.1)]">
                <div
                    ref={containerRef}
                    dir="ltr"
                    className="w-full relative grid grid-cols-10 grid-rows-3 gap-[2px] bg-[#d3ccb8]"
                >
                    {squares.map((num) => (
                        <Square key={`square-${num}`} number={num} />
                    ))}

                    {dimensions.width > 0 &&
                        board.map((piece) => (
                            <Piece
                                key={piece.id}
                                piece={piece}
                                containerWidth={dimensions.width}
                                containerHeight={dimensions.height}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}
