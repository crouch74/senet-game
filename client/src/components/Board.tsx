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
        <div className="relative w-full max-w-5xl mx-auto border-4 border-[#3c2a21] rounded-sm bg-[#523A28]/50 shadow-2xl overflow-hidden p-[2px]">
            {/* Wood texture background overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#2c1a11]/40 mix-blend-overlay pointer-events-none border border-sand/10" />

            <div
                ref={containerRef}
                className="w-full relative grid grid-cols-10 grid-rows-3 gap-[1px]"
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
    );
}
