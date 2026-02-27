// Maps visual grid coordinates (row, col) to square numbers (1-30)
// Row 0: 1 to 10
// Row 1: 20 down to 11
// Row 2: 21 to 30

export const getSquareNumber = (row: number, col: number): number => {
    if (row === 0) return col + 1;
    if (row === 1) return 20 - col;
    if (row === 2) return 21 + col;
    return 0;
};
