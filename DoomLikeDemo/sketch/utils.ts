function segmentIntersection(a0: Point, a1: Point, b0: Point, b1: Point): Point | null {
    // a0 * t + a1 * (1 - t) - parametric line equation
    // a0 * t + a1 * (1 - t) = b0 * l + b1 * (1 - l)
    //
    // a0_X * t + a1_X * (1 - t) = b0_X * l + b1_X * (1 - l)
    // a0_Y * t + a1_Y * (1 - t) = b0_Y * l + b1_Y * (1 - l)
    // a0_X * t + a1_X * (1 - t) => a0_X * t + a1_X - t * a1_X => (a0_X - a1_X) * t + a1_X
    //
    // (a0_X - a1_X) * t + a1_X = (b0_X - b1_X) * l + b1_X
    // (a0_X - a1_X) * t = (b0_X - b1_X) * l + b1_X - a1_X
    //
    // t = ((b0_X - b1_X) * l + b1_X - a1_X) / (a0_X - a1_X)
    // t = ((b0_Y - b1_Y) * l + b1_Y - a1_Y) / (a0_Y - a1_Y)
    //
    // ((b0_X - b1_X) * l + b1_X - a1_X) / (a0_X - a1_X) = ((b0_Y - b1_Y) * l + b1_Y - a1_Y) / (a0_Y - a1_Y)
    // ((b0_X - b1_X) * l + b1_X - a1_X) * (a0_Y - a1_Y) = ((b0_Y - b1_Y) * l + b1_Y - a1_Y) * (a0_X - a1_X)
    //
    // (b0_X - b1_X) * (a0_Y - a1_Y) * l + (b1_X - a1_X) * (a0_Y - a1_Y) = (b0_Y - b1_Y) * (a0_X - a1_X) * l + (b1_Y - a1_Y) * (a0_X - a1_X)
    // (b0_X - b1_X) * (a0_Y - a1_Y) * l - (b0_Y - b1_Y) * (a0_X - a1_X) * l = (b1_Y - a1_Y) * (a0_X - a1_X) - (b1_X - a1_X) * (a0_Y - a1_Y)
    // ((b0_X - b1_X) * (a0_Y - a1_Y) - (b0_Y - b1_Y) * (a0_X - a1_X)) * l = (b1_Y - a1_Y) * (a0_X - a1_X) - (b1_X - a1_X) * (a0_Y - a1_Y)
    //
    // l =   ((b1_Y - a1_Y) * (a0_X - a1_X) - (b1_X - a1_X) * (a0_Y - a1_Y))
    //     / ((b0_X - b1_X) * (a0_Y - a1_Y) - (b0_Y - b1_Y) * (a0_X - a1_X))

    const l =
        ((b1.y - a1.y) * (a0.x - a1.x) - (b1.x - a1.x) * (a0.y - a1.y)) /
        ((b0.x - b1.x) * (a0.y - a1.y) - (b0.y - b1.y) * (a0.x - a1.x));
    const t = ((b0.x - b1.x) * l + b1.x - a1.x) / (a0.x - a1.x);

    if (t <= 0 && l >= 0 && l <= 1) {
        const intersect_point = a0
            .copy()
            .mult(t)
            .add(a1.copy().mult(1 - t));
        return intersect_point;
    } else {
        return null;
    }
}
