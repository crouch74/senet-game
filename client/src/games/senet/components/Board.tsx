import { Piece } from './Piece'
import { Square } from './Square'
import { useBoardViewModel } from './board/useBoardViewModel'

export function Board() {
  const { containerRef, pieceModels, squareModels } = useBoardViewModel()

  return (
    <div className="relative w-full max-w-5xl mx-auto border-[10px] sm:border-[12px] md:border-[16px] border-ui-board-frame rounded-md bg-ui-board-frame shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(0,0,0,0.8)] p-[2px] sm:p-[3px] md:p-[4px] [filter:url(#jitter)]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-ui-board-overlay to-ui-board-overlay-edge mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-sm" />

      <div className="relative bg-ui-board-ivory p-[2px] rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.1)]">
        <div
          ref={containerRef}
          dir="ltr"
          className="w-full relative grid grid-cols-10 grid-rows-3 gap-[2px] bg-ui-board-grid"
        >
          {squareModels.map((squareModel) => (
            <Square key={`square-${squareModel.number}`} {...squareModel} />
          ))}

          {pieceModels.map((pieceModel) => (
            <Piece key={pieceModel.piece.id} {...pieceModel} />
          ))}
        </div>
      </div>
    </div>
  )
}
